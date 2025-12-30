import { ICamera, ImageClassifier } from "../../library";
const PROFILING_PREFIX = '\x1b[35m[PRF]\x1b[0m';

type EventByPts = {
    offset: number | undefined,
    events: {
        timestampMs: number,
        eventName: string,
    }[],
};

export class RunnerProfiling {
    private _startupTime = Date.now();
    private _ptsFirstEv = new Map<string, number>();
    private _ptsLastEv = new Map<string, number>();
    private _eventsByPts = new Map<string, EventByPts>();
    private _filenameToPts = new Map<string, string>();

    constructor(camera: ICamera, imgClassifier: ImageClassifier) {
        camera.on('profilingInfo', (ev) => {
            if (ev.type === 'frame_ready' || ev.type === 'event-without-filename') {
                const key = ev.type === 'frame_ready' ? 'frame_ready' : ev.name;
                const pts = ev.pts;
                const date = ev.ts;
                let eventByPts: EventByPts;

                if (ev.type === 'frame_ready') {
                    this._ptsFirstEv.set(pts, Date.now());
                    this._ptsLastEv.set(pts, Date.now());
                    eventByPts = { offset: ev.offset, events: [] };
                    this._eventsByPts.set(pts, eventByPts);
                }
                else {
                    if (!this._eventsByPts.has(pts)) {
                        console.log(PROFILING_PREFIX, `received camera profilingInfo, but cannot find pts: ${JSON.stringify(ev)}`);
                        return;
                    }
                    eventByPts = this._eventsByPts.get(pts)!;
                }

                const msSinceStart = `${(+date - this._startupTime).toString().padStart(8, ' ')}ms.`;
                const msSinceBeginEv = `${(Date.now() - this._ptsFirstEv.get(pts)!).toString().padStart(4, ' ')}ms.`;
                const msSinceLastEv = `${(Date.now() - this._ptsLastEv.get(pts)!).toString().padStart(4, ' ')}ms.`;
                console.log(PROFILING_PREFIX, `ts=${msSinceStart} frame=${eventByPts.offset} ts_ev=${msSinceBeginEv} since_last=${msSinceLastEv} ` +
                    `module=camera ev=${key}`);
                this._ptsLastEv.set(pts, Date.now());

                eventByPts.events.push({
                    timestampMs: Date.now() - this._ptsFirstEv.get(pts)!,
                    eventName: key,
                });
            }
            else if (ev.type === 'pts-to-filename') {
                if (this._filenameToPts.has(ev.filename)) {
                    const currPts = this._filenameToPts.get(ev.filename)!;
                    if (currPts !== ev.pts) {
                        console.log(PROFILING_PREFIX, `[WARN] pts changed for "${ev.filename} (curr=${currPts}, new=${ev.pts})`);
                    }
                }
                this._filenameToPts.set(ev.filename, ev.pts);
            }
            else if (ev.type === 'event-with-filename') {
                const evByPts = this.getEventByPtsForFilename(ev.filename);
                if (!evByPts) return;

                evByPts.eventByPts.events.push({
                    timestampMs: Date.now() - evByPts.firstEventMs,
                    eventName: ev.name,
                });
                this.logWithFilename(ev.ts, ev.filename, `module=camera ev=${ev.name}`);
            }
        });

        camera.on('snapshot', (buffer, filename) => {
            this.logWithFilename(new Date(), filename, `module=camera ev=snapshot`);
        });

        const handleImgClassifierEvent = (filename: string, key: string) => {
            const evByPts = this.getEventByPtsForFilename(filename);
            if (!evByPts) return;

            evByPts.eventByPts.events.push({
                timestampMs: Date.now() - evByPts.firstEventMs,
                eventName: key,
            });

            this.logWithFilename(new Date(), filename, `module=img_classifier ev=${key}`);
        };

        imgClassifier.on('profileSnapshotHandlerBegin', filename => {
            handleImgClassifierEvent(filename, `snapshot_handler_begin`);
        });
        imgClassifier.on('profileSnapshotHandlerEnd', filename => {
            handleImgClassifierEvent(filename, `snapshot_handler_end`);
        });
        imgClassifier.on('profileFeaturesBegin', filename => {
            handleImgClassifierEvent(filename, `features_begin`);
        });
        imgClassifier.on('profileFeaturesEnd', filename => {
            handleImgClassifierEvent(filename, `features_end`);
        });
        imgClassifier.on('profileClassifyBegin', filename => {
            handleImgClassifierEvent(filename, `classify_begin`);
        });
        imgClassifier.on('profileClassifyEnd', (filename, timingCppMs) => {
            handleImgClassifierEvent(filename, `classify_end inference_time_cpp=${JSON.stringify(timingCppMs)}`);
        });
        imgClassifier.on('profileEmitResultBegin', filename => {
            handleImgClassifierEvent(filename, `emit_result_begin`);
        });
        imgClassifier.on('profileEmitResultEnd', filename => {
            handleImgClassifierEvent(filename, `emit_result_end`);
        });
    }

    printSummary() {
        let frameReadyToEmitResultEnd = { sum: 0, count: 0 };
        let frameReadyToClassifyBegin = { sum: 0, count: 0 };

        let eventMap: { [ key: string]: { sum: number, count: number } } = { };

        for (const frameId of this._eventsByPts.keys()) {
            const val = this._eventsByPts.get(frameId)!;

            for (let ix = 1; ix < val.events.length; ix++) {
                const prev = val.events[ix - 1];
                const curr = val.events[ix];

                const prevEvName = prev.eventName.startsWith('classify_end') ?
                    'classify_end' :
                    prev.eventName;
                const currEvName = curr.eventName.startsWith('classify_end') ?
                    'classify_end' :
                    curr.eventName;

                const eventMapKey = `${prevEvName}:${currEvName}`;
                if (!eventMap[eventMapKey]) {
                    eventMap[eventMapKey] = { count: 0, sum: 0 };
                }
                eventMap[eventMapKey].count++;
                eventMap[eventMapKey].sum += (curr.timestampMs - prev.timestampMs);
            }

            let frameReady: number | undefined;
            let classifyBegin: number | undefined;
            let resultEnd: number | undefined;

            for (const event of val.events) {
                if (event.eventName === 'frame_ready') {
                    frameReady = event.timestampMs;
                }
                else if (event.eventName === 'classify_begin') {
                    classifyBegin = event.timestampMs;
                }
                else if (event.eventName === 'emit_result_end') {
                    resultEnd = event.timestampMs;
                }
            }

            // only allow events that have both frame_ready and emit_result_end
            if (typeof frameReady !== 'number' || typeof resultEnd !== 'number') continue;


            if (typeof classifyBegin === 'number') {
                frameReadyToClassifyBegin.sum += classifyBegin;
                frameReadyToClassifyBegin.count++;
            }

            frameReadyToEmitResultEnd.sum += (resultEnd - frameReady);
            frameReadyToEmitResultEnd.count++;
        }

        console.log('');
        console.log(PROFILING_PREFIX, `Profiling summary:`);

        if (frameReadyToEmitResultEnd.count > 0) {
            console.log(PROFILING_PREFIX, `    Full inference (frame_ready → emit_result_end): avg=` +
                (frameReadyToEmitResultEnd.sum / frameReadyToEmitResultEnd.count).toFixed(1) + 'ms.',
                `(${frameReadyToEmitResultEnd.count} frames)`
            );
        }
        else {
            console.log(PROFILING_PREFIX, `    Full inference (frame_ready → emit_result_end): N/A`);
        }

        console.log(PROFILING_PREFIX);
        console.log(PROFILING_PREFIX, `Per-event summary:`);

        if (frameReadyToClassifyBegin.count > 0) {
            console.log(PROFILING_PREFIX, `    frame_ready → classify_begin: avg=` +
                (frameReadyToClassifyBegin.sum / frameReadyToClassifyBegin.count).toFixed(1) + 'ms.',
                `(${frameReadyToClassifyBegin.count} frames)`
            );
        }
        else {
            console.log(PROFILING_PREFIX, `    frame_ready → classify_begin: N/A`);
        }

        for (const key of Object.keys(eventMap)) {
            const [ ev1, ev2 ] = key.split(':');
            const val = eventMap[key];
            console.log(PROFILING_PREFIX, `    ${ev1} → ${ev2}: avg=` +
                (val.sum / val.count).toFixed(1) + 'ms.',
                `(${val.count} frames)`
            );
        }
    }

    private logWithFilename(ts: Date, filename: string, msg: string) {
        const evByPts = this.getEventByPtsForFilename(filename);
        if (!evByPts) return;

        const msSinceStart = `${(+ts - this._startupTime).toString().padStart(8, ' ')}ms.`;
        const msSinceBeginEv = `${(+ts - evByPts.firstEventMs).toString().padStart(4, ' ')}ms.`;
        const msSinceLastEv = `${(+ts - evByPts.lastEventMs).toString().padStart(4, ' ')}ms.`;
        console.log(PROFILING_PREFIX, `ts=${msSinceStart} frame=${evByPts.eventByPts.offset} ts_ev=${msSinceBeginEv} since_last=${msSinceLastEv} filename=${filename} ${msg}`);
        this._ptsLastEv.set(evByPts.pts, +ts);
    }

    private getEventByPtsForFilename(filename: string) {
        const pts = this._filenameToPts.get(filename);
        if (!pts) {
            console.log(PROFILING_PREFIX, `[WARN] filename "${filename}" does not have pts attached`);
            return null;
        }

        const eventByPts = this._eventsByPts.get(pts);
        if (!eventByPts) {
            return null;
        }

        const firstEventMs = this._ptsFirstEv.get(pts) || 0;
        const lastEventMs = this._ptsLastEv.get(pts) || 0;

        return {
            pts,
            firstEventMs,
            lastEventMs,
            eventByPts,
        };
    }
}
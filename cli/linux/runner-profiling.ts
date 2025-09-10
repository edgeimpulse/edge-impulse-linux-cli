import { ICamera, ImageClassifier } from "../../library";
const PROFILING_PREFIX = '\x1b[35m[PRF]\x1b[0m';

export class RunnerProfiling {
    private _startupTime = Date.now();
    private _filenameToFrameIx = new Map<string, number>();
    private _frameIxFirstEv = new Map<number, number>();
    private _frameIxLastEv = new Map<number, number>();
    private _frameId = -1;

    constructor(camera: ICamera, imgClassifier: ImageClassifier) {
        camera.on('profilingInfo', (date, key) => {
            let id: number;
            if (key === 'frame_ready') {
                id = ++this._frameId;
                this._frameIxFirstEv.set(id, Date.now());
                this._frameIxLastEv.set(id, Date.now());
            }
            else {
                id = this._frameId;
            }
            const msSinceStart = `${(+date - this._startupTime).toString().padStart(8, ' ')}ms.`;
            const msSinceBeginEv = `${(Date.now() - this._frameIxFirstEv.get(id)!).toString().padStart(4, ' ')}ms.`;
            const msSinceLastEv = `${(Date.now() - this._frameIxLastEv.get(id)!).toString().padStart(4, ' ')}ms.`;
            console.log(PROFILING_PREFIX, `ts=${msSinceStart} frame_id=${id} ts_ev=${msSinceBeginEv} since_last=${msSinceLastEv} ` +
                `module=camera ev=${key}`);
            this._frameIxLastEv.set(id, Date.now());
        });

        camera.on('snapshot', (buffer, filename) => {
            this._filenameToFrameIx.set(filename, this._frameId);
            this.logWithFilename(filename, `module=camera ev=snapshot`);
        });
        imgClassifier.on('profileSnapshotHandlerBegin', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=snapshot_handler_begin`);
        });
        imgClassifier.on('profileSnapshotHandlerEnd', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=snapshot_handler_end`);
        });
        imgClassifier.on('profileFeaturesBegin', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=features_begin`);
        });
        imgClassifier.on('profileFeaturesEnd', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=features_end`);
        });
        imgClassifier.on('profileClassifyBegin', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=classify_begin`);
        });
        imgClassifier.on('profileClassifyEnd', (filename, timingCppMs) => {
            this.logWithFilename(filename, `module=img_classifier ev=classify_end inference_time_cpp=${JSON.stringify(timingCppMs)}`);
        });
        imgClassifier.on('profileEmitResultBegin', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=emit_result_begin`);
        });
        imgClassifier.on('profileEmitResultEnd', filename => {
            this.logWithFilename(filename, `module=img_classifier ev=emit_result_end`);
        });
    }

    private logWithFilename(filename: string, msg: string) {
        const frameId = this._filenameToFrameIx.get(filename);
        if (!frameId) {
            console.log(PROFILING_PREFIX, `WARN: Cannot find frame ID for filename (${filename}): ${msg}`);
            return;
        }

        const msSinceStart = `${(Date.now() - this._startupTime).toString().padStart(8, ' ')}ms.`;
        const msSinceBeginEv = `${(Date.now() - this._frameIxFirstEv.get(frameId)!).toString().padStart(4, ' ')}ms.`;
        const msSinceLastEv = `${(Date.now() - this._frameIxLastEv.get(frameId)!).toString().padStart(4, ' ')}ms.`;
        console.log(PROFILING_PREFIX, `ts=${msSinceStart} frame_id=${frameId} ts_ev=${msSinceBeginEv} since_last=${msSinceLastEv} filename=${filename} ${msg}`);
        this._frameIxLastEv.set(frameId, Date.now());
    }
}
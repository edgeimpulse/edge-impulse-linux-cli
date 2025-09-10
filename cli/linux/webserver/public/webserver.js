window.WebServer = async (vmStr) => {

    const vm = JSON.parse(decodeURIComponent(vmStr));
    console.log('vm', vm);

    const els = {
        title: document.querySelector('#header-row h1'),
        cameraOuterContainer: document.querySelector('#capture-camera .capture-camera-outer'),
        cameraContainer: document.querySelector('#capture-camera .capture-camera-inner'),
        cameraImg: document.querySelector('#capture-camera img'),
        timePerInference: document.querySelector('#time-per-inference'),
        additionalInfo: document.querySelector('#additional-info'),
        timePerInferenceContainer: document.querySelector('#time-per-inference-container'),
        additionalInfoContainer: document.querySelector('#additional-info-container'),
        imageClassify: {
            row: document.querySelector('#image-classification-conclusion'),
            text: document.querySelector('#image-classification-conclusion .col'),
        },
        views: {
            loading: document.querySelector('#loading-view'),
            captureCamera: document.querySelector('#capture-camera'),
        },
        resultsTable: document.querySelector('#results-table'),
        resultsThead: document.querySelector('#results-table thead tr'),
        resultsTbody: document.querySelector('#results-table tbody'),
        thresholdsBody: document.querySelector('#thresholds-body'),
        websocketAddress: document.querySelector('#websocket-address'),
    };

    const colors = [
        '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#42d4f4', '#f032e6', '#fabed4',
        '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3',
    ];
    let colorIx = 0;
    const labelToColor = { };
    let isFirstClassification = true;
    let inferenceIx = 0;
    let lastClassification;

    function switchView(el) {
        for (let k of Object.keys(els.views)) {
            els.views[k].style.display = 'none';
        }
        el.style.display = '';
    }

    function bindThresholdSettings(thresholds) {
        els.thresholdsBody.innerHTML = '';

        let h3 = document.createElement('h3');
        h3.textContent = 'Thresholds';
        els.thresholdsBody.appendChild(h3);

        if (!thresholds) {
            let msgEl = document.createElement('div');
            let emEl = document.createElement('em');
            emEl.classList.add('text-sm');
            emEl.textContent = 'Model does not support setting thresholds. Re-build the eim file to change the thresholds.';
            msgEl.appendChild(emEl);
            els.thresholdsBody.appendChild(msgEl);
            return;
        }

        if (thresholds.length === 0) {
            let msgEl = document.createElement('div');
            let emEl = document.createElement('em');
            emEl.classList.add('text-sm');
            emEl.textContent = 'Model does not have any settable thresholds.';
            msgEl.appendChild(emEl);
            els.thresholdsBody.appendChild(msgEl);
            return;
        }

        let thresholdsDiv = document.createElement('div');
        thresholdsDiv.classList.add('mb--3');

        let thresholdHintContainer = document.createElement('div');
        thresholdHintContainer.classList.add('mb-3');
        function setThresholdHint() {
            let em = document.createElement('em');
            em.classList.add('text-sm', 'd-block');
            em.textContent = `To override the thresholds, start the runner with:`;

            let code = document.createElement('code');
            code.classList.add('d-block');

            let opts = [];
            for (let threshold of thresholds) {
                for (let k of Object.keys(threshold)) {
                    if (k === 'id' || k === 'type') continue;
                    if (typeof threshold[k] === 'number') {
                        let rounded = Math.round(threshold[k] * 1000) / 1000;
                        opts.push(`${threshold.id}.${k}=${rounded}`);
                    }
                    else if (typeof threshold[k] === 'boolean') {
                        opts.push(`${threshold.id}.${k}=${threshold[k]}`);
                    }
                    else {
                        continue;
                    }
                }
            }

            code.textContent = `--thresholds ${opts.join(',')}`;

            thresholdHintContainer.textContent = '';
            thresholdHintContainer.appendChild(em);
            thresholdHintContainer.appendChild(code);
        }

        for (let threshold of thresholds) {

            for (let k of Object.keys(threshold)) {
                if (k === 'id' || k === 'type') continue;
                if (typeof threshold[k] !== 'number' && typeof threshold[k] !== 'boolean') continue;

                let rowEl = document.createElement('div');
                rowEl.classList.add('mb-3');

                let labelEl = document.createElement('label');
                labelEl.classList.add('form-control-label', 'w-100');
                labelEl.textContent = `${threshold.type}: ${k} (block ID: ${threshold.id})`;
                rowEl.appendChild(labelEl);

                let inputEl = document.createElement('input');

                if (typeof threshold[k] === 'number') {
                    inputEl.classList.add('form-control', 'form-control-sm', 'text-default', 'font-monospace');
                    let rounded = Math.round(threshold[k] * 1000) / 1000;
                    inputEl.value = rounded;
                    rowEl.appendChild(inputEl);
                }
                else if (typeof threshold[k] === 'boolean') {
                    let cbWrapperEl = document.createElement('div');
                    cbWrapperEl.classList.add('custom-control', 'custom-control-alternative', 'custom-checkbox');

                    inputEl.classList.add('custom-control-input');
                    inputEl.type = 'checkbox';
                    inputEl.autocomplete = 'off';
                    inputEl.checked = threshold[k] ? true : false;
                    inputEl.id = `cb-${threshold.id}-${k}`;

                    let cbLabelEl = document.createElement('label');
                    cbLabelEl.classList.add('custom-control-label', 'pl-2');
                    cbLabelEl.setAttribute('for', inputEl.id);
                    cbLabelEl.textContent = '\xa0'; // &nbsp;

                    cbWrapperEl.appendChild(inputEl);
                    cbWrapperEl.appendChild(cbLabelEl);

                    rowEl.appendChild(cbWrapperEl);
                }


                thresholdsDiv.appendChild(rowEl);

                inputEl.oninput = () => {
                    if (typeof threshold[k] === 'number') {
                        if (!inputEl.value || isNaN(Number(inputEl.value))) return;
                        if (k === 'min_score' && Number(inputEl.value) === 0) return;

                        threshold[k] = Number(inputEl.value);
                    }
                    else if (typeof threshold[k] === 'boolean') {
                        threshold[k] = inputEl.checked;
                    }

                    socket.emit('threshold-override', {
                        id: threshold.id,
                        key: k,
                        value: threshold[k],
                    });

                    setThresholdHint();
                };
            }
        }

        setThresholdHint();
        thresholdsDiv.appendChild(thresholdHintContainer);

        els.thresholdsBody.appendChild(thresholdsDiv);

        // prevent closing on click inside the dropdown menu
        document.querySelector('.dropdown-menu').addEventListener('click', ev => {
            ev.stopPropagation();
        });
    }

    // Here is how we connect back to the server
    const socket = io.connect(location.origin);
    socket.on('connect', () => {
        socket.emit('hello');
    });

    socket.on('hello', (opts) => {
        console.log('hello', opts);

        els.title.textContent = els.title.title = opts.projectName;

        switchView(els.views.captureCamera);
        bindThresholdSettings(opts.thresholds);
    });

    const onWindowResize = () => {
        if (els.cameraContainer.naturalWidth === 0) {
            return;
        }

        let oldStyleWidth = els.cameraImg.style.width;
        const containerWidth = els.cameraOuterContainer.getBoundingClientRect().width;

        // height >480
        if (els.cameraImg.naturalHeight > 480) {
            // and fits within the container? just display as is
            if (els.cameraImg.naturalWidth < containerWidth) {
                els.cameraImg.style.width = els.cameraImg.naturalWidth + 'px';
            }
            else {
                // does not fit within container? just use 100%
                els.cameraImg.style.width = containerWidth + 'px';
            }
        }
        else {
            // what if we resize to 480 high?
            const factor = els.cameraImg.naturalWidth / els.cameraImg.naturalHeight;
            let newHeight = 480;
            let newWidth = newHeight * factor;

            // fits within the container? just display as is
            if (newWidth < containerWidth) {
                els.cameraImg.style.width = newWidth + 'px';
            }
            else {
                // does not fit within container? just use 100%
                els.cameraImg.style.width = containerWidth + 'px';
            }
        }

        if (oldStyleWidth !== els.cameraImg.style.width && lastClassification) {
            onClassification({
                dontUpdateTable: true,
                ...lastClassification,
            });
        }
    };

    let isFirstImage = true;
    socket.on('image', (opts) => {
        if (isFirstImage) {
            els.cameraImg.onload = () => {
                onWindowResize();
                els.cameraImg.onload = null;
            };
            isFirstImage = false;
        }
        els.cameraImg.src = opts.img;
    });
    window.addEventListener('resize', onWindowResize);

    let lastFivePerfCalPredictions = [];

    function onClassification(opts) {
        lastClassification = opts;

        let result = opts.result;
        let modelType = opts.modelType;

        els.timePerInference.textContent = opts.timeMs;
        els.additionalInfo.textContent = opts.additionalInfo;
        if (!vm.isEmbedView) {
            els.timePerInferenceContainer.style.display = '';
        }
        els.additionalInfoContainer.style.display = '';

        console.log('classification', opts.result, opts.timeMs);

        for (let bx of Array.from(els.cameraContainer.querySelectorAll('.bounding-box-container'))) {
            bx.parentNode?.removeChild(bx);
        }

        els.imageClassify.row.style.display = 'none';

        if (result.classification && !opts.dontUpdateTable) {
            const showOnlyTopResults = Object.keys(result.classification).length > 10 && !result.visual_anomaly_grid;

            if (isFirstClassification) {
                if (showOnlyTopResults) {
                    // only 1 results th
                    {
                        let th = document.createElement('th');
                        th.scope = 'col';
                        th.textContent = th.title = 'Top 5 results';
                        th.classList.add('px-0', 'text-center');
                        els.resultsThead.appendChild(th);
                    }

                    // unless also have anomaly...
                    if (Object.keys(result.classification).indexOf('anomaly') > -1) {
                        let th = document.createElement('th');
                        th.scope = 'col';
                        th.textContent = th.title = 'anomaly';
                        th.classList.add('px-0', 'text-center');
                        els.resultsThead.appendChild(th);
                    }
                }
                else {
                    for (let ix = 0; ix < Object.keys(result.classification).length; ix++) {
                        const key = Object.keys(result.classification)[ix];

                        let th = document.createElement('th');
                        th.scope = 'col';
                        th.classList.add('px-0', 'text-center');
                        th.textContent = th.title = key;
                        els.resultsThead.appendChild(th);
                    }
                }

                if (result.visual_anomaly_grid) {
                    let th = document.createElement('th');
                    th.scope = 'col';
                    th.classList.add('px-0', 'text-center');
                    th.textContent = th.title = 'anomaly';
                    els.resultsThead.appendChild(th);
                }

                els.resultsTable.style.display = '';
                isFirstClassification = false;
            }

            els.imageClassify.row.style.display = '';

            let conclusion = vm.hasPerformanceCalibration ? '...' : 'uncertain';
            let highest = Math.max(...Object.values(result.classification));

            for (let k of Object.keys(result.classification)) {
                if (result.classification[k] >= 0.55) {
                    if (vm.hasPerformanceCalibration) {
                        conclusion = k;
                    }
                    else {
                        conclusion = k + ' (' + result.classification[k].toFixed(2) + ')';
                    }
                }
            }

            // for perfcal models, if one of the last 5 predictions was the keyword => select that
            if (vm.hasPerformanceCalibration) {
                lastFivePerfCalPredictions.push(conclusion);
                if (lastFivePerfCalPredictions.length > 5) {
                    lastFivePerfCalPredictions = lastFivePerfCalPredictions.slice(
                        lastFivePerfCalPredictions.length - 5);
                }

                const dedup = Array.from(new Set(lastFivePerfCalPredictions));
                if (dedup.length === 2 && dedup.find(x => x === '...')) {
                    conclusion = dedup.find(x => x !== '...');
                }
            }

            // both visual AD and we have at least 1 anomaly
            let isVisualAnomaly = false;
            if (result.visual_anomaly_grid && result.visual_anomaly_grid.length > 0) {
                conclusion = 'anomaly (' + (result.visual_anomaly_max || 0).toFixed(2) + ')';
                isVisualAnomaly = true;
            }

            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            td1.textContent = (++inferenceIx).toString();
            tr.appendChild(td1);
            if (showOnlyTopResults) {
                // only print top 5
                let td = document.createElement('td');

                let results = [];
                for (const key of Object.keys(result.classification)) {
                    if (key === 'anomaly') continue;

                    results.push({
                        label: key,
                        value: result.classification[key],
                    });
                }

                const top = results.sort((a, b) => b.value - a.value).slice(0, 5);
                for (let ix = 0; ix < top.length; ix++) {
                    let span = ix === 0 ? document.createElement('strong') : document.createElement('span');
                    span.textContent = `${top[ix].label}: ${top[ix].value.toFixed(2)}`;
                    td.appendChild(span);

                    if (ix !== top.length - 1) {
                        let commaSpan = document.createElement('span');
                        commaSpan.textContent = ', ';
                        td.appendChild(commaSpan);
                    }
                }
                tr.appendChild(td);

                if (Object.keys(result.classification).indexOf('anomaly') > -1) {
                    let anomalyTd = document.createElement('td');
                    anomalyTd.classList.add('text-center');
                    anomalyTd.textContent = result.classification.anomaly.toFixed(2);
                    tr.appendChild(anomalyTd);
                }
            }
            else {
                for (let k of Object.keys(result.classification)) {
                    let td = document.createElement('td');
                    td.classList.add('text-center');
                    td.textContent = result.classification[k].toFixed(2);
                    if (result.classification[k] === highest && !isVisualAnomaly) {
                        td.style.fontWeight = 600;
                    }
                    tr.appendChild(td);
                }
            }

            if (result.visual_anomaly_grid) {
                let td = document.createElement('td');
                td.classList.add('text-center');
                td.textContent = (result.visual_anomaly_max || 0).toFixed(2);
                if (isVisualAnomaly) {
                    td.style.fontWeight = 600;
                }
                tr.appendChild(td);
            }

            tr.classList.add('active');
            setTimeout(() => {
                tr.classList.remove('active');
            }, 200);
            if (els.resultsTbody.firstChild) {
                els.resultsTbody.insertBefore(tr, els.resultsTbody.firstChild);
            }
            else {
                els.resultsTbody.appendChild(tr);
            }

            // keep max n rows
            if (els.resultsTbody.childElementCount >= 100) {
                els.resultsTbody.removeChild(els.resultsTbody.lastChild);
            }

            els.imageClassify.text.textContent = conclusion;

            // for image classification models, draw overlay on top of the image with top 3 conclusions in embed mode
            if (vm.sensorType === 'camera' && vm.isEmbedView) {
                let results = [];
                for (const key of Object.keys(result.classification)) {
                    if (key === 'anomaly') continue;

                    results.push({
                        label: key,
                        value: result.classification[key],
                    });
                }

                // don't change order if we only have 3
                const top = results.length > 3 ?
                    results.sort((a, b) => b.value - a.value).slice(0, 3) :
                    results;
                if (result.visual_anomaly_grid) {
                    // also visual AD? add to top results
                    top.push({
                        label: 'anomaly',
                        value: result.visual_anomaly_max,
                    });
                }

                let classificationOverlayEl = els.cameraContainer.querySelector('.classification-top-overlay');
                if (!classificationOverlayEl) {
                    classificationOverlayEl = document.createElement('div');
                    classificationOverlayEl.classList.add('classification-top-overlay');
                    els.cameraContainer.appendChild(classificationOverlayEl);
                }
                classificationOverlayEl.textContent = '';

                for (const topRes of top) {
                    const topDiv = document.createElement('div');
                    topDiv.textContent = `${topRes.label} (${topRes.value.toFixed(2)})`;
                    classificationOverlayEl.appendChild(topDiv);
                }

                els.imageClassify.row.style.display = 'none';
            }
        }
        if (result.bounding_boxes) {
            let factor = els.cameraImg.naturalHeight / els.cameraImg.clientHeight;

            for (let b of result.object_tracking || result.bounding_boxes) {
                let bb = {
                    x: b.x / factor,
                    y: b.y / factor,
                    width: b.width / factor,
                    height: b.height / factor,
                    label: 'object_id' in b ?
                        `${b.label} (ID ${b.object_id})` :
                        b.label,
                    value: 'value' in b ? b.value : undefined,
                };

                if (!labelToColor[bb.label]) {
                    labelToColor[bb.label] = colors[colorIx++ % colors.length];
                }

                let color = labelToColor[bb.label];

                let el = document.createElement('div');
                el.classList.add('bounding-box-container');
                el.style.position = 'absolute';
                el.style.border = 'solid 3px ' + color;

                if (modelType === 'object_detection') {
                    el.style.width = (bb.width) + 'px';
                    el.style.height = (bb.height) + 'px';
                    el.style.left = (bb.x) + 'px';
                    el.style.top = (bb.y) + 'px';
                }
                else if (modelType === 'constrained_object_detection') {
                    let centerX = bb.x + (bb.width / 2);
                    let centerY = bb.y + (bb.height / 2);

                    el.style.borderRadius = '10px';
                    el.style.width = 20 + 'px';
                    el.style.height = 20 + 'px';
                    el.style.left = (centerX - 10) + 'px';
                    el.style.top = (centerY - 10) + 'px';
                }

                let label = document.createElement('div');
                label.classList.add('bounding-box-label');
                label.style.background = color;
                label.textContent = bb.label;
                if (typeof bb.value === 'number') {
                    label.textContent += ' (' + bb.value.toFixed(2) + ')';
                }
                if (modelType === 'constrained_object_detection') {
                    el.style.whiteSpace = 'nowrap';
                }
                el.appendChild(label);

                els.cameraContainer.appendChild(el);
            }
        }
        if (result.visual_anomaly_grid) {
            let factor = els.cameraImg.naturalHeight / els.cameraImg.clientHeight;

            for (let b of result.visual_anomaly_grid) {
                let bb = {
                    x: b.x / factor,
                    y: b.y / factor,
                    width: b.width / factor,
                    height: b.height / factor,
                    label: b.label,
                    value: b.value
                };

                let el = document.createElement('div');
                el.classList.add('bounding-box-container');
                el.style.position = 'absolute';
                el.style.background = 'rgba(255, 0, 0, 0.5)';
                el.style.width = (bb.width) + 'px';
                el.style.height = (bb.height) + 'px';
                el.style.left = (bb.x) + 'px';
                el.style.top = (bb.y) + 'px';

                let scoreFontSize = '';
                let scoreText = bb.value.toFixed(2);
                if (bb.width < 15) {
                    scoreFontSize = '4px';
                    scoreText = bb.value.toFixed(1);
                }
                else if (bb.width < 20) {
                    scoreFontSize = '6px';
                    scoreText = bb.value.toFixed(1);
                }
                else if (bb.width < 32) {
                    scoreFontSize = '9px';
                }

                let score = document.createElement('div');
                score.style.color = 'white';
                if (scoreFontSize) {
                    score.style.fontSize = scoreFontSize;
                }
                score.textContent = scoreText;
                el.appendChild(score);

                // Center align the score
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';

                els.cameraContainer.appendChild(el);
            }
        }
    }

    socket.on('classification', onClassification);

    if (els.websocketAddress) {
        els.websocketAddress.textContent = `ws://${location.host}`;
    }

    // Here's a helper function that'll loop every second, checks if "classification-top-overlay" is present
    // and then switches between white/black text automatically. If this element is not created, it just sits idle
    (async () => {
        function getAvgBrightness(img, x, y, w, h) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Scale from CSS coords (relative to image on page) to natural pixel coords
            const scaleX = img.naturalWidth / img.clientWidth;
            const scaleY = img.naturalHeight / img.clientHeight;

            const sx = (x - img.getBoundingClientRect().x) * scaleX;
            const sy = (y - img.getBoundingClientRect().y) * scaleY;
            const sw = w * scaleX;
            const sh = h * scaleY;

            const data = ctx.getImageData(sx, sy, sw, sh).data;

            let total = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                total += (r * 299 + g * 587 + b * 114) / 1000;
            }

            // debug info
            // const cropCanvas = document.createElement('canvas');
            // cropCanvas.width  = sw;
            // cropCanvas.height = sh;
            // const cctx = cropCanvas.getContext('2d');
            // cctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            // const cropEl = document.querySelector('#crop') || document.createElement('img');
            // cropEl.id = 'crop';
            // cropEl.src = cropCanvas.toDataURL('image/png');
            // document.body.appendChild(cropEl);

            return total / (data.length / 4);
        }

        if (!vm.isEmbedView || vm.sensorType !== 'camera') return;

        while (1) {
            const labelEl = document.querySelector('.classification-top-overlay');
            if (!labelEl) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const rect = labelEl.getBoundingClientRect();
            const brightness = getAvgBrightness(els.cameraImg, rect.x, rect.y, rect.width, rect.height);
            if (brightness > 180) {
                labelEl.style.color = 'black';
            }
            else {
                labelEl.style.color = 'white';
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    })();
};

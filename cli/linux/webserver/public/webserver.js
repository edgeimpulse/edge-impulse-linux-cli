window.WebServer = async () => {

    const els = {
        title: document.querySelector('#header-row h1'),
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
    };

    const colors = [
        '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#42d4f4', '#f032e6', '#fabed4',
        '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3',
    ];
    const labelToColor = { };

    function switchView(el) {
        for (let k of Object.keys(els.views)) {
            els.views[k].style.display = 'none';
        }
        el.style.display = '';
    }

    // Here is how we connect back to the server
    const socket = io.connect(location.origin);
    socket.on('connect', () => {
        socket.emit('hello');
    });

    socket.on('hello', (opts) => {
        els.title.textContent = opts.projectName;

        switchView(els.views.captureCamera);
    });

    socket.on('image', (opts) => {
        els.cameraImg.src = opts.img;
    });

    let isFirstClassification = true;
    let inferenceIx = 0;

    socket.on('classification', (opts) => {
        let result = opts.result;
        let modelType = opts.modelType;

        els.timePerInference.textContent = opts.timeMs;
        els.additionalInfo.textContent = opts.additionalInfo;
        els.timePerInferenceContainer.style.display = '';
        els.additionalInfoContainer.style.display = '';

        console.log('classification', opts.result, opts.timeMs);

        for (let bx of Array.from(els.cameraContainer.querySelectorAll('.bounding-box-container'))) {
            bx.parentNode?.removeChild(bx);
        }

        els.imageClassify.row.style.display = 'none';

        if (result.classification) {
            if (isFirstClassification) {
                for (let ix = 0; ix < Object.keys(result.classification).length; ix++) {
                    const key = Object.keys(result.classification)[ix];

                    let th = document.createElement('th');
                    th.scope = 'col';
                    th.classList.add('px-0', 'text-center');
                    th.textContent = th.title = key;
                    els.resultsThead.appendChild(th);
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

            let conclusion = 'uncertain';
            let highest = Math.max(...Object.values(result.classification));

            for (let k of Object.keys(result.classification)) {
                if (result.classification[k] >= 0.55) {
                    conclusion = k + ' (' + result.classification[k].toFixed(2) + ')';
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
            for (let k of Object.keys(result.classification)) {
                let td = document.createElement('td');
                td.classList.add('text-center');
                td.textContent = result.classification[k].toFixed(2);
                if (result.classification[k] === highest && !isVisualAnomaly) {
                    td.style.fontWeight = 600;
                }
                tr.appendChild(td);
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
        }
        if (result.bounding_boxes) {
            let factor = els.cameraImg.naturalHeight / els.cameraImg.clientHeight;

            for (let b of result.bounding_boxes) {
                let bb = {
                    x: b.x / factor,
                    y: b.y / factor,
                    width: b.width / factor,
                    height: b.height / factor,
                    label: b.label,
                    value: b.value
                };

                if (!labelToColor[bb.label]) {
                    labelToColor[bb.label] = colors[0];
                    colors.splice(0, 1);
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
                label.textContent = bb.label + ' (' + bb.value.toFixed(2) + ')';
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

                let score = document.createElement('div');
                score.style.color = 'white';
                score.textContent = bb.value.toFixed(2);
                el.appendChild(score);

                // Center align the score
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';

                els.cameraContainer.appendChild(el);
            }
        }
    });
};

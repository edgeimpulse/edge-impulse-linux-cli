window.InferenceServer = async (opts) => {
    const { modelType } = JSON.parse(decodeURIComponent(opts));

    const els = {
        uploadFile: document.querySelector('#upload-file'),
        runInferenceBtn: document.querySelector('#run-inference'),
        resultSection: document.querySelector('#result-section'),
        resultSectionPre: document.querySelector('#result-section pre'),
        previewSection: document.querySelector('#preview-section'),
        previewSectionImgContainer: document.querySelector('#preview-image-container'),
        previewSectionImg:  document.querySelector('#preview-section img'),
        features: document.querySelector('#features'),
        maskLeft: document.querySelector('.label-mask-left'),
        maskRight: document.querySelector('.label-mask-right'),
        maskTop: document.querySelector('.label-mask-top'),
        maskBottom: document.querySelector('.label-mask-bottom')
    };

    const colors = [
        '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#42d4f4', '#f032e6', '#fabed4',
        '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3',
    ];
    let colorIx = 0;
    const labelToColor = { };

    if (els.uploadFile) {
        els.uploadFile.oninput = () => {
            if (els.uploadFile.files.length > 0) {
                els.runInferenceBtn.disabled = false;
            }
            else {
                els.runInferenceBtn.disabled = true;
            }
        };
        if (els.uploadFile.files.length > 0) {
            els.runInferenceBtn.disabled = false;
        }
        else {
            els.runInferenceBtn.disabled = true;
        }
    }

    if (els.features) {
        els.features.oninput = () => {
            if (els.features.value.length > 0) {
                els.runInferenceBtn.disabled = false;
            }
            else {
                els.runInferenceBtn.disabled = true;
            }
        };
        if (els.features.value.length > 0) {
            els.runInferenceBtn.disabled = false;
        }
        else {
            els.runInferenceBtn.disabled = true;
        }
    }

    els.runInferenceBtn.onclick = async (ev) => {
        ev.preventDefault();

        const origText = els.runInferenceBtn.textContent;

        els.runInferenceBtn.disabled = true;
        els.runInferenceBtn.textContent = 'Running inference...';

        try {
            let resp;
            if (els.uploadFile) {
                if (els.uploadFile.files.length === 0) return;

                let formData = new FormData();
                formData.append('file', els.uploadFile.files[0]);

                resp = await fetch('/api/image', {
                    body: formData,
                    method: 'post',
                });
            }
            else if (els.features) {
                if (els.features.value.length === 0) return;

                let features = els.features.value.split(',').map(n => Number(n.trim()));

                resp = await fetch('/api/features', {
                    body: JSON.stringify({
                        features: features,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'post',
                });
            }
            else {
                throw new Error('Could not find either upload or features elements');
            }

            const text = await resp.text();
            let body;
            try {
                body = JSON.parse(text);
            }
            catch (ex) {
                throw new Error(text);
            }

            if (els.uploadFile && (body.result.bounding_boxes || body.result.visual_anomaly_grid)) {
                els.previewSection.style.display = '';

                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = e => {
                        resolve(e.target.result);
                    };
                    reader.onerror = err => {
                        reject(err);
                    };

                    reader.readAsDataURL(els.uploadFile.files[0]);
                });

                els.previewSectionImg.onload = () => {
                    const result = body.result;
                    let factor = els.previewSectionImg.naturalHeight / els.previewSectionImg.clientHeight;

                    for (let oldEl of els.previewSectionImgContainer.querySelectorAll('.bounding-box-container')) {
                        oldEl.parentNode.removeChild(oldEl);
                    }

                    for (let b of (result.bounding_boxes || [])) {
                        let bb = {
                            x: b.x / factor,
                            y: b.y / factor,
                            width: b.width / factor,
                            height: b.height / factor,
                            label: b.label,
                            value: b.value
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
                            el.style.width = '20px';
                            el.style.height = '20px';
                            el.style.left = (centerX - 10) + 'px';
                            el.style.top = (centerY - 10) + 'px';
                        }

                        let label = document.createElement('div');
                        label.classList.add('bounding-box-label');
                        label.style.background = color;
                        label.textContent = bb.label + ' (' + bb.value.toFixed(2) + ')';
                        el.style.whiteSpace = 'nowrap';
                        el.appendChild(label);
                        els.previewSectionImgContainer.appendChild(el);
                    }

                    for (let b of (result.visual_anomaly_grid || [])) {
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

                        els.previewSectionImgContainer.appendChild(el);
                    }

                    // Only the fit-shortest resizing mode crops the image
                    if (result.resized && result.resizeMode === 'fit-shortest') {
                        const { originalWidth, originalHeight, newWidth, newHeight } = result.resized;
                        const img = {
                            clientWidth: originalWidth,
                            clientHeight: originalHeight,
                            referenceWidth: newWidth,
                            referenceHeight: newHeight,
                        };
                        maskCropped(img);
                    }
                    else {
                        hideCropMasks();
                    }
                };

                els.previewSectionImg.src = dataUrl;

            }
            else {
                els.previewSectionImg.onload = null;
                els.previewSection.style.display = 'none';
            }

            els.resultSection.style.display = '';
            els.resultSectionPre.textContent = JSON.stringify(body, null, 4);
        }
        catch (ex) {
            alert('Failed to run inference: ' + (ex.message || ex.toString()));
        }
        finally {
            els.runInferenceBtn.disabled = false;
            els.runInferenceBtn.textContent = origText;
        }
    };

    // rerender bounding boxes on resize
    window.onresize = () => {
        if (els.previewSectionImg.onload) {
            els.previewSectionImg.onload();
        }
    };

    // Shared from bounding-box-scaling.ts. If we introduce a TypeScript build step we can
    // share this code directly.
    const getMaskPercent = (side, img) => {
        // Use reference aspect ratio to determine mask size as a percentage
        const referenceAspect = img.referenceWidth / img.referenceHeight;
        const clientAspect = img.clientWidth / img.clientHeight;
        let percent = 0;
        if (side === 'horizontal' && clientAspect > referenceAspect) {
            // Image is wider than reference: mask left/right
            const displayWidth = img.clientHeight * referenceAspect;
            percent = ((img.clientWidth - displayWidth) / 2) / img.clientWidth * 100;
        }
        else if (side === 'vertical' && clientAspect < referenceAspect) {
            // Image is taller than reference: mask top/bottom
            const displayHeight = img.clientWidth / referenceAspect;
            percent = ((img.clientHeight - displayHeight) / 2) / img.clientHeight * 100;
        }
        return percent;
    };

    // Shared from bounding-box-scaling.ts
    const maskCropped = (img) => {
        const referenceAspect = img.referenceWidth / img.referenceHeight;
        const clientAspect = img.clientWidth / img.clientHeight;

        if (clientAspect > referenceAspect) {
            // Image is wider than reference: mask left/right
            const maskPercent = getMaskPercent('horizontal', img);
            els.maskLeft.style.width = els.maskRight.style.width = maskPercent + '%';
            els.maskTop.style.height = els.maskBottom.style.height = '0%';
            els.maskLeft.style.height = els.maskRight.style.height = '100%';
        }
        else if (clientAspect < referenceAspect) {
            // Image is taller than reference: mask top/bottom
            const maskPercent = getMaskPercent('vertical', img);
            els.maskLeft.style.width = els.maskRight.style.width = '0%';
            els.maskTop.style.height = els.maskBottom.style.height = maskPercent + '%';
            els.maskTop.style.width = els.maskBottom.style.width = '100%';
        }
        else {
            hideCropMasks();
        }
    };

    const hideCropMasks = () => {
        els.maskLeft.style.width = els.maskRight.style.width = '0%';
        els.maskTop.style.height = els.maskBottom.style.height = '0%';
    };
};

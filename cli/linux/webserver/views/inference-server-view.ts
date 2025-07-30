import html from './escape-html-template-tag';

export type InferenceServerModelViewModel = {
    modelType: 'classification' | 'object_detection' | 'constrained_object_detection',
} & ({
    mode: 'features',
    featuresCount: number,
} | {
    mode: 'image',
    width: number,
    height: number,
    depth: 'Grayscale' | 'RGB',
    showImagePreview: boolean,
});

export type InferenceServerViewModel = {
    studioLink: string,
    owner: string,
    projectName: string,
    projectVersion: number,
    serverPort: number,
    model: InferenceServerModelViewModel,
};

export const renderInferenceServerView = (vm: InferenceServerViewModel) => {
    let resultsColClass = `col-12`;
    if (vm.model.mode === 'image' && vm.model.showImagePreview) {
        resultsColClass = `col-12 col-lg-6`;
    }

    const opts = encodeURIComponent(JSON.stringify({
        modelType: vm.model.modelType,
    }));

    return html`<!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <title>${vm.owner} / ${vm.projectName} (v${vm.projectVersion}) - Edge Impulse inference server</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
        <link rel="stylesheet" href="/assets/argon-dashboard.css">
        <link rel="stylesheet" href="/assets/mobileclient.css">
        <!-- generics -->
        <link rel="icon" href="/assets/favicon-color/favicon-32.png" sizes="32x32">
        <link rel="icon" href="/assets/favicon-color/favicon-57.png" sizes="57x57">
        <link rel="icon" href="/assets/favicon-color/favicon-76.png" sizes="76x76">
        <link rel="icon" href="/assets/favicon-color/favicon-96.png" sizes="96x96">
        <link rel="icon" href="/assets/favicon-color/favicon-128.png" sizes="128x128">
        <link rel="icon" href="/assets/favicon-color/favicon-196.png" sizes="196x196">
        <link rel="icon" href="/assets/favicon-color/favicon-228.png" sizes="228x228">
        <!-- Android -->
        <link rel="shortcut icon" href="/assets/favicon-color/favicon-196.png" sizes="196x196">
        <!-- iOS -->
        <link rel="apple-touch-icon" href="/assets/favicon-color/favicon-120.png" sizes="120x120">
        <link rel="apple-touch-icon" href="/assets/favicon-color/favicon-152.png" sizes="152x152">
        <link rel="apple-touch-icon" href="/assets/favicon-color/favicon-180.png" sizes="180x180">
        <!-- Windows -->
        <meta name="msapplication-TileColor" content="#FFFFFF">
        <meta name="msapplication-TileImage" content="/assets/favicon-color/favicon-144.png">

        <!-- (c) Copyright 2024, Edge Impulse Inc. -->
    </head>

    <body>
        <div class="container-fluid">
            <div class="row align-items-center border-bottom" id="header-row">
                <div class="col-auto mt-3 mb-3 pr-0">
                    <img src="/assets/mark.svg">
                </div>
                <div class="col align-middle inference-server-view-title-col">
                    <h1 class="text-dark mb-0 border-left pl-4"
                        title="Edge Impulse inference server">
                        Edge Impulse inference server
                    </h1>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <div class="card shadow">
                        <div class="card-body text-left mb--4">
                            <div class="row card-sub-header border-bottom mt--2">
                                <div class="col">
                                    <h4>Model information</h4>
                                </div>
                            </div>
                            <div class="mb-2 text-sm">
                                Inference server for "<a href="${vm.studioLink}" target="_blank">${vm.owner} / ${vm.projectName}</a>" (v${vm.projectVersion}).
                            </div>
                            <div class="row card-sub-header border-bottom">
                                <div class="col">
                                    <h4>Get model info</h4>
                                </div>
                            </div>
                            <div class="mb-3 text-sm">
                                <code>curl -v -X GET http://localhost:${vm.serverPort}/api/info</code>
                            </div>
                            <div class="row card-sub-header border-bottom">
                                <div class="col">
                                    <h4>How to run inference</h4>
                                </div>
                            </div>
                            ${vm.model.mode === 'image' ? html`
                            <div class="mb-3 text-sm">
                                <code>curl -v -X POST -F 'file=@path-to-an-image.jpg' http://localhost:${vm.serverPort}/api/image</code>
                            </div>
                            <div class="mb-4 text-xs">
                                (Expecting a ${vm.model.width} x ${vm.model.height} (${vm.model.depth}) image, images in other resolutions will be resized)
                            </div>
                            ` : html`
                            <div class="mb-3 text-sm">
                                <code>curl -v -X POST -H "Content-Type: application/json" -d '{"features": [5, 10, 15, 20]}' http://localhost:${vm.serverPort}/api/features</code>
                            </div>
                            <div class="mb-4 text-xs">
                                (Expecting ${vm.model.featuresCount} features for this model)
                            </div>
                            `}
                        </div>
                    </div>
                    <div class="card shadow mt-4">
                        <div class="card-body text-left mb--3">
                            <div class="row card-sub-header border-bottom mt--2">
                                <div class="col">
                                    <h4>Try out inferencing</h4>
                                </div>
                            </div>
                            ${vm.model.mode === 'image' ? html`
                            <div class="mb-3">
                                <input type="file" class="form-control form-control-sm border-0 px-0" id="upload-file">
                            </div>
                            ` : html`
                            <div class="mb-2 text-sm">
                                Enter ${vm.model.featuresCount} features, split by ',' - for example from "Live classification".
                            </div>
                            <div class="mb-3">
                                <input class="form-control form-control-sm" id="features" placeholder="0, 0, 0, 0, ...">
                            </div>
                            `}
                            <div class="mb-3">
                                <button class="btn-sm btn btn-primary" id="run-inference" disabled>Run inference</button>
                            </div>

                            <div class="row mb-3" id="result-section" style="display: none">
                                <div class="${resultsColClass}">
                                    <div class="row card-sub-header border-bottom">
                                        <div class="col">
                                            <h4>Result</h4>
                                        </div>
                                    </div>
                                    <pre class="text-xs mb-0">Bleep bloop</pre>
                                </div>
                                <div id="preview-section" class="${resultsColClass}" style="display: none">
                                    <div class="row card-sub-header border-bottom">
                                        <div class="col">
                                            <h4>Preview</h4>
                                        </div>
                                    </div>
                                    <div id="preview-image-container" class="mt-3"><img id="preview-image"></img></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="footer">
            <div class="row">
                <div class="col text-center">
                    <div class="copyright text-center text-muted">
                        <i class="fas fa-code"></i>
                        Developed by <a href="https://edgeimpulse.com" class="font-weight-bold" target="_blank">Edge Impulse</a>.
                    </div>
                </div>
            </div>
        </footer>

        <script type="text/javascript" src="/inference-server.js"></script>
        <script>
            window.InferenceServer('${opts}');
        </script>
    </body>
    </html>
    `;
};

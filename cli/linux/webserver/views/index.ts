import html from './escape-html-template-tag';

export type IndexViewModel = {
    isEmbedView: boolean;
};

export const renderIndexView = (vm: IndexViewModel) => {
    return html`<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Edge Impulse for Linux</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
    <link rel="stylesheet" href="/assets/argon-dashboard.css">
    <link rel="stylesheet" href="/assets/fontawesome-free-5.15.4-web/css/all.min.css">
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
    <meta name="msapplication-TileImage" content="assets/favicon-color/favicon-144.png">

    <!-- (c) Copyright 2021-${new Date().getFullYear()}, EdgeImpulse Inc. -->
</head>

<body ${vm.isEmbedView ? html`class="embed-view"` : ``}>
    <div class="container-fluid">
        <div class="row align-items-center border-bottom" id="header-row">
            <div class="col-auto mt-3 mb-3 pr-0 header-logo-col">
                <img src="assets/mark.svg">
            </div>
            <div class="col align-middle">
                <h1 class="text-dark mb-0">...</h1>
            </div>
            <div class="pl-0 col-auto text-right my--1 pr-1">
                <div class="dropdown">
                    <a class="btn btn-icon-only text-gray mr-0" href="#" role="button"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Integrate predictions in your app">
                        <i class="fas fa-code"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-arrow p-3 mb--1" style="max-width: 400px; width: calc(100vw - 1rem);">
                        <h3>Integrate predictions in your app</h3>
                        <div class="text-sm mb-1">To stream these live predictions to any application, just open a websocket to:</div>
                        <div class="text-sm mb-1"><code id="websocket-address">ws://localhost:4912</code></div>
                    </div>
                </div>
            </div>
            <div class="pl-0 col-auto text-right my--1">
                <div class="dropdown">
                    <a class="btn btn-icon-only text-gray mr-0" href="#" role="button"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Configure thresholds">
                        <i class="fas fa-cog"></i>
                    </a>
                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-arrow" id="thresholds-body">
                        <h3>Thresholds</h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4" id="loading-view">
            <div class="col">
                <div class="card shadow">
                    <div class="card-body text-center card-icon mt-4">
                        <div class="sk-folding-cube">
                            <div class="sk-cube1 sk-cube"></div>
                            <div class="sk-cube2 sk-cube"></div>
                            <div class="sk-cube4 sk-cube"></div>
                            <div class="sk-cube3 sk-cube"></div>
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <h2 id="loading-view-text">Loading...</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="row ${vm.isEmbedView ? `mt-0` : `mt-4`}" id="capture-camera" style="display: none; position: relative;">
            <div class="col">
                <div class="card ${vm.isEmbedView ? `border-top-0` : `shadow`}" style="position: relative;">
                    <div class="card-body text-center">
                        <div class="row mb-4">
                            <div class="col">
                                <div class="capture-camera-inner">
                                    <img style="min-height: 480px">
                                </div>
                            </div>
                        </div>
                        <div class="row mt-2" id="image-classification-conclusion">
                            <h2 class="col"></h2>
                        </div>
                        <div class="row mt-2" id="time-per-inference-container" style="display: none">
                            <div class="col text-xs">Time per inference: <span id="time-per-inference"></span> ms.</div>
                        </div>
                        <div class="row mt-2" id="additional-info-container" style="white-space: pre-wrap; display: none">
                            <div class="col text-xs"><span id="additional-info"></span></div>
                        </div>
                    </div>

                    <section id="inferencing-in-progress">
                        <table class="table align-items-center table-flush table-hover" id="results-table" style="display: none;">
                            <thead class="thead-light">
                                <tr>
                                    <th scope="col" style="width: 80px"></th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </section>
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

    <script src="/assets/js/plugins/jquery/dist/jquery.min.js"></script>
    <script src="/assets/js/plugins/bootstrap/dist/js/bootstrap.bundle.js"></script>
    <script type="text/javascript" src="/socket.io/socket.io.js"></script>
    <script type="text/javascript" src="/webserver.js"></script>
    <script>
        window.WebServer();
    </script>
</body>
</html>
`;
};

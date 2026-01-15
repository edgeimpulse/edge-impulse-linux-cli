import assert from "assert";
import {
    GStreamer,
    GStreamerMode
} from "../library/sensors/gstreamer";
import {
    SpawnHelperType
} from "../library/sensors/spawn-helper";
import fs from 'node:fs/promises';
import { format } from "node:path";

describe("gstreamer", () => {
    describe("parse devices", () => {
        // https://forum.edgeimpulse.com/t/error-setting-up-jetson-nano-with-a-csi-camera/1794/28
        it("nvidia jetson w/ csi camera", async () => {
            const gstOutput = await fs.readFile('./test/nvidia-jetson-w-csi-camera.txt', { encoding: 'utf-8' });

            const gstLaunchNvargusCameraSrcOutput = `nvarguscamerasrc options GST_ARGUS: Creating output stream
GST_ARGUS: Available Sensor modes :
GST_ARGUS: 3264 x 2464 FR = 21.000000 fps Duration = 47619048 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: 3264 x 1848 FR = 28.000001 fps Duration = 35714284 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: 1920 x 1080 FR = 29.999999 fps Duration = 33333334 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: 1640 x 1232 FR = 29.999999 fps Duration = 33333334 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: 1280 x 720 FR = 59.999999 fps Duration = 16666667 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: 1280 x 720 FR = 120.000005 fps Duration = 8333333 ; Analog Gain range min 1.000000, max 10.625000; Exposure Range min 13000, max 683709000;
GST_ARGUS: Running with following settings:
GST_ARGUS: Setup Complete, Starting captures for 0 seconds
GST_ARGUS: Starting repeat capture requests.
GST_ARGUS: Cleaning up
GST_ARGUS: Done Success
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                gstInspect: () => 'nvarguscamerasrc',
                gstLaunch: (args: string[]) => {
                    if (args[0] === 'nvarguscamerasrc') {
                        return gstLaunchNvargusCameraSrcOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstLaunch command: ' + JSON.stringify(args));
                    }
                }
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, 'nvarguscamerasrc');
            assert.equal(devices[0].name, 'CSI camera (nvarguscamerasrc)');
            assert.equal(devices[0].videoSource, 'nvarguscamerasrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    framerate: 21,
                    height: 2464,
                    width: 3264,
                    type: 'nvarguscamerasrc'
                },
                {
                    framerate: 28.000001,
                    height: 1848,
                    width: 3264,
                    type: 'nvarguscamerasrc'
                },
                {
                    framerate: 29.999999,
                    height: 1080,
                    width: 1920,
                    type: 'nvarguscamerasrc'
                },
                {
                    framerate: 29.999999,
                    height: 1232,
                    width: 1640,
                    type: 'nvarguscamerasrc'
                },
                {
                    framerate: 59.999999,
                    height: 720,
                    width: 1280,
                    type: 'nvarguscamerasrc'
                },
                {
                    framerate: 120.000005,
                    height: 720,
                    width: 1280,
                    type: 'nvarguscamerasrc'
                }
            ]));
        });

        // Tested locally (Jan)
        it("nvidia jetson w/ Logitech C922", async () => {
            const gstOutput = await fs.readFile('./test/nvidia-jetson-w-logitech-c922-monitor.txt', { encoding: 'utf-8' });

            const gstLaunchNvargusCameraSrcOutput = `Setting pipeline to PAUSED ...
Pipeline is live and does not need PREROLL ...
Setting pipeline to PLAYING ...
New clock: GstSystemClock
Error generated. /dvs/git/dirty/git-master_linux/multimedia/nvgstreamer/gst-nvarguscamera/gstnvarguscamerasrc.cpp, execute:645 No cameras available

(gst-launch-1.0:17101): GStreamer-CRITICAL **: 11:58:19.104: gst_mini_object_set_qdata: assertion 'object != NULL' failed
^Chandling interrupt.
Interrupt: Stopping pipeline ...
Execution ended after 0:00:03.636570581
Setting pipeline to PAUSED ...
Setting pipeline to READY ...
Setting pipeline to NULL ...
Freeing pipeline ...
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                gstInspect: () => 'nvarguscamerasrc',
                gstLaunch: (args: string[]) => {
                    if (args[0] === 'nvarguscamerasrc') {
                        return gstLaunchNvargusCameraSrcOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstLaunch command: ' + JSON.stringify(args));
                    }
                }
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'C922 Pro Stream Webcam (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([
                {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: []
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: []
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30,
                    formats: []
                }
            ]));
        });

        // https://forum.edgeimpulse.com/t/usb-camera-on-raspberry-pi/1758
        it("usb camera on rpi w/ image/jpeg", async () => {
            const gstOutput = await fs.readFile('./test/usb-camera-on-rpi-w-image-jpg.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 3);

            assert.equal(devices[0].id, '/dev/video0');
            // TODO: this looks like bug in captured output (check usb-camera-on-rpi-w-image-jpg.txt line 6)
            // the output in this file comes from the forum (see link above) so maybe user pasted it incorrectly?
            assert.equal(devices[0].name, 'USB           : USB (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                type: "image/jpeg",
                width: 1280,
                height: 720,
                framerate: 30,
                formats: []
            }]));

            assert.equal(devices[1].id, '/dev/video14');
            assert.equal(devices[1].name, 'bcm2835-isp (/dev/video14)');
            assert.equal(devices[1].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: []
            }]));

            assert.equal(devices[2].id, '/dev/video15');
            assert.equal(devices[2].name, 'bcm2835-isp (/dev/video15)');
            assert.equal(devices[2].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[2].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: []
            }]));
        });

        it("rpi cam v3 c920 webcam bookworm no libcamerasrc", async () => {
            const gstOutput = await fs.readFile('./test/rpi-cam-v3-c920-webcam-bookworm-no-libcamerasrc.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 6);

            assert.equal(devices[0].id, '/dev/video2');
            assert.equal(devices[0].name, 'HD Pro Webcam C920 (/dev/video2)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: 'video/x-raw',
                    width: 2560,
                    height: 1472,
                    framerate: 2,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 960,
                    height: 720,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 864,
                    height: 480,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 960,
                    height: 720,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: 'image/jpeg',
                    width: 864,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }

             ]));

            assert.equal(devices[1].id, '/dev/video14');
            assert.equal(devices[1].name, 'bcm2835-isp (/dev/video14)');
            assert.equal(devices[1].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: [ "YUY2", "UYVY", "NV12", "I420", "YV12", "BGRx", "RGBx", "BGR", "RGB", "NV21", "RGB16", "YVYU" ]
            }]));

            assert.equal(devices[2].id, '/dev/video15');
            assert.equal(devices[2].name, 'bcm2835-isp (/dev/video15)');
            assert.equal(devices[2].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[2].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: [ "YUY2", "UYVY", "NV12", "I420", "YV12", "NV21", "YVYU" ]
            }]), "For device /dev/video15");

            assert.equal(devices[3].id, '/dev/video21');
            assert.equal(devices[3].name, 'bcm2835-isp (/dev/video21)');
            assert.equal(devices[3].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[4].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: [ "YUY2", "UYVY", "NV12", "I420", "YV12", "NV21", "YVYU" ]
            }]), "For device /dev/video21");

            assert.equal(devices[4].id, '/dev/video22');
            assert.equal(devices[4].name, 'bcm2835-isp (/dev/video22)');
            assert.equal(devices[4].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[4].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0,
                formats: [ "YUY2", "UYVY", "NV12", "I420", "YV12", "NV21", "YVYU" ]
            }]), "For device /dev/video22");

            assert.equal(devices[5].id, '/dev/video0');
            assert.equal(devices[5].name, 'unicam (/dev/video0)');
            assert.equal(devices[5].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[5].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 16,
                height: 16,
                framerate: 0,
                formats: [ "YUY2", "UYVY", "xRGB", "BGR", "RGB", "BGR15", "RGB15", "RGB16", "GRAY8", "GRAY16", "YVYU" ]
            }]), "For device /dev/video0");

        });

        // https://forum.edgeimpulse.com/t/edge-impulse-on-coral-edgetpu/2311
        it("coral edge tpu with iMX6S", async () => {
            const gstOutput = `Probing devices...


Device found:

    name  : i.MX6S_CSI
    class : Video/Source
    caps  : video/x-raw, format=(string)YUY2, width=(int)2592, height=(int)1944, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)15/1;
            video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/1, 30/1 };
            video/x-raw, format=(string)YUY2, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1;
            video/x-raw, format=(string)YUY2, width=(int)720, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1;
            video/x-raw, format=(string)YUY2, width=(int)640, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1;
    properties:
        udev-probed = true
        device.bus_path = platform-30a90000.csi1_bridge
        sysfs.path = /sys/devices/platform/30a90000.csi1_bridge/video4linux/video0
        device.subsystem = video4linux
        device.product.name = i.MX6S_CSI
        device.capabilities = :capture:
        device.api = v4l2
        device.path = /dev/video0
        v4l2.device.driver = mx6s-csi
        v4l2.device.card = i.MX6S_CSI
        v4l2.device.bus_info = platform:30a90000.csi1_bridge
        v4l2.device.version = 265826 (0x00040e62)
        v4l2.device.capabilities = 2216689665 (0x84200001)
        v4l2.device.device_caps = 69206017 (0x04200001)
    gst-launch-1.0 v4l2src ! ...
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'i.MX6S_CSI (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 2592,
                    height: 1944,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 720,
                    height: 480,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: []
                }
            ]));
        });

        // https://forum.edgeimpulse.com/t/raspberry-pi-4-logitech-c922-error/3160/3
        it("logitech c922 on rpi bullseye", async () => {
            const gstOutput = await fs.readFile('./test/logitech-c922-on-rpi-bullseye.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 2);


            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/scb/pcie@7d500000/pci@0,0/usb@0,0-1.2:1.0-046d:085c');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 176,
                    height: 144,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 180,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 240,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 352,
                    height: 288,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 432,
                    height: 240,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 360,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 480,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 448,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 864,
                    height: 480,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 600,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1024,
                    height: 576,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 960,
                    height: 720,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1280,
                    height: 720,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1600,
                    height: 896,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1920,
                    height: 1080,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1296,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1536,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }]));

            assert.equal(devices[1].id, '/dev/video0');
            assert.equal(devices[1].name, 'UvcH264 Video Capture 4 (/dev/video0)');
            assert.equal(devices[1].videoSource, 'uvch264src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }
            ]));
        });

        it("logitech c920 on ubuntu 22 parallells", async () => {
            const gstOutput = await fs.readFile('./test/logitech-c920-on-ubuntu-22-parallells.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'HD Pro Webcam C920 (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([
                {
                   type: "video/x-raw",
                   width: 640,
                   height: 480,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 160,
                   height: 90,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 160,
                   height: 120,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 176,
                   height: 144,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 320,
                   height: 180,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 320,
                   height: 240,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 352,
                   height: 288,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 432,
                   height: 240,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 640,
                   height: 360,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 800,
                   height: 448,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 800,
                   height: 600,
                   framerate: 24,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 864,
                   height: 480,
                   framerate: 24,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 960,
                   height: 720,
                   framerate: 15,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 1024,
                   height: 576,
                   framerate: 15,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 1280,
                   height: 720,
                   framerate: 10,
                   formats: [ "YUY2" ]
                },
                {
                   type: "video/x-raw",
                   width: 1600,
                   height: 896,
                   framerate: 15,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 800,
                   height: 600,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 864,
                   height: 480,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 960,
                   height: 720,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 1024,
                   height: 576,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 1280,
                   height: 720,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 1600,
                   height: 896,
                   framerate: 30,
                   formats: [ "YUY2" ]
                },
                {
                   type: "image/jpeg",
                   width: 1920,
                   height: 1080,
                   framerate: 30,
                   formats: [ "YUY2" ]
                }
             ]));
        });

        // https://github.com/edgeimpulse/edgeimpulse/issues/3975
        it("renesas w/ usb camera", async () => {
            const gstOutput = `Probing devices...


Device found:

        name  : HD Pro Webcam C920
        class : Video/Source
        caps  : video/x-raw, format=(string)YUY2, width=(int)2304, height=(int)1536, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)2/1;
                video/x-raw, format=(string)YUY2, width=(int)2304, height=(int)1296, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)2/1;
                video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)5/1;
                video/x-raw, format=(string)YUY2, width=(int)1600, height=(int)896, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)960, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)1024, height=(int)576, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)800, height=(int)600, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)864, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)800, height=(int)448, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)640, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)640, height=(int)360, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)432, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)352, height=(int)288, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)320, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)320, height=(int)180, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)176, height=(int)144, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)160, height=(int)120, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-raw, format=(string)YUY2, width=(int)160, height=(int)90, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)1920, height=(int)1080, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)1600, height=(int)896, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)960, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)1024, height=(int)576, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)800, height=(int)600, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)864, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)800, height=(int)448, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)640, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)640, height=(int)360, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)432, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)352, height=(int)288, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)320, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)320, height=(int)180, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)176, height=(int)144, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)160, height=(int)120, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                image/jpeg, width=(int)160, height=(int)90, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)1920, height=(int)1080, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)1600, height=(int)896, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)960, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)1024, height=(int)576, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)800, height=(int)600, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)864, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)800, height=(int)448, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)640, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)640, height=(int)360, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)432, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)352, height=(int)288, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)320, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)320, height=(int)180, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)176, height=(int)144, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)160, height=(int)120, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
                video/x-h264, stream-format=(string)byte-stream, alignment=(string)au, width=(int)160, height=(int)90, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
        properties:
                udev-probed = true
                device.bus_path = platform-11c70100.usb-usb-0:1:1.0
                sysfs.path = /sys/devices/platform/soc/11c70100.usb/usb2/2-1/2-1:1.0/video4linux/video1
                device.bus = usb
                device.subsystem = video4linux
                device.vendor.id = 046d
                device.vendor.name = 046d
                device.product.id = 082d
                device.product.name = "HD\ Pro\ Webcam\ C920"
                device.serial = 046d_HD_Pro_Webcam_C920_EB8A47AF
                device.capabilities = :capture:
                device.api = v4l2
                device.path = /dev/video1
                v4l2.device.driver = uvcvideo
                v4l2.device.card = "HD\ Pro\ Webcam\ C920"
                v4l2.device.bus_info = usb-11c70100.usb-1
                v4l2.device.version = 267173 (0x000413a5)
                v4l2.device.capabilities = 2225078273 (0x84a00001)
                v4l2.device.device_caps = 69206017 (0x04200001)
        gst-launch-1.0 v4l2src device=/dev/video1 ! ...

`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video1');
            assert.equal(devices[0].name, 'HD Pro Webcam C920 (/dev/video1)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30,
                    formats: []
                }
            ]));
        });

        // https://github.com/edgeimpulse/edgeimpulse/issues/3975
        it("renesas w/ csi camera", async () => {
            const gstOutput = `Probing devices...


Device found:

        name  : RZG2L_CRU
        class : Video/Source
        caps  : video/x-raw, format=(string)YUY2, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)UYVY, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)ARGB, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)BGRA, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)BGRx, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)BGR, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)NV16, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-bayer, format=(string)gbrg, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-bayer, format=(string)grbg, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-bayer, format=(string)bggr, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-bayer, format=(string)rggb, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)GRAY8, framerate=(fraction)[ 0/1, 2147483647/1 ], width=(int)[ 320, 2800 ], height=(int)[ 240, 4096 ], pixel-aspect-ratio=(fraction)1/1;
        properties:
                udev-probed = true
                device.bus_path = platform-10830000.video
                sysfs.path = /sys/devices/platform/soc/10830000.video/video4linux/video0
                device.subsystem = video4linux
                device.product.name = RZG2L_CRU
                device.capabilities = :capture:
                device.api = v4l2
                device.path = /dev/video0
                v4l2.device.driver = rzg2l_cru
                v4l2.device.card = RZG2L_CRU
                v4l2.device.bus_info = platform:10830000.video
                v4l2.device.version = 267173 (0x000413a5)
                v4l2.device.capabilities = 2233466881 (0x85200001)
                v4l2.device.device_caps = 85983233 (0x05200001)
        gst-launch-1.0 v4l2src ! ...
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'RZG2L_CRU (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 640,
                height: 480,
                framerate: 0,
                formats: []
            }]));
        });

        // Tested locally (Jan)
        it("logitech c922 on rpi bullseye #2", async () => {
            const gstOutput = await fs.readFile('./test/logitech-c922-on-rpi-bullseye-2.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 2);


            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/scb/pcie@7d500000/pci@1,0/usb@1,0-1.1:1.0-046d:085c');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 176,
                    height: 144,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 180,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 240,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 352,
                    height: 288,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 432,
                    height: 240,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 360,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 480,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 448,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 864,
                    height: 480,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 600,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1024,
                    height: 576,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 960,
                    height: 720,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1280,
                    height: 720,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1600,
                    height: 896,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 1920,
                    height: 1080,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1296,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1536,
                    framerate: 0,
                    formats: [ "YUY2" ]
                }]));

            assert.equal(devices[1].id, '/dev/video0');
            assert.equal(devices[1].name, 'UvcH264 C922 Pro Stream Webcam (/dev/video0)');
            assert.equal(devices[1].videoSource, 'uvch264src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([
                {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }
            ]));
        });

        it("am68a w/ usb camera", async () => {
            const gstOutput = `Probing devices...


Device found:

    name  : HD Pro Webcam C920
    class : Video/Source
    caps  : video/x-raw, format=(string)YUY2, width=(int)176, height=(int)144, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/1, 10/1, 15/2, 5/1 };
            video/x-raw, format=(string)YUY2, width=(int)160, height=(int)120, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 15/1, 10/1, 15/2, 5/1 };
            video/x-raw, format=(string)YUY2, width=(int)160, height=(int)90, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)640, height=(int)480, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)640, height=(int)360, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)432, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)352, height=(int)288, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)320, height=(int)240, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)320, height=(int)180, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)176, height=(int)144, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)160, height=(int)120, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
            image/jpeg, width=(int)160, height=(int)90, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
    properties:
            udev-probed = true
            device.bus_path = platform-xhci-hcd.0.auto-usb-0:1.3:1.0
            sysfs.path = "/sys/devices/platform/bus\@100000/4104000.cdns-usb/6000000.usb/xhci-hcd.0.auto/usb1/1-1/1-1.3/1-1.3:1.0/video4linux/video2"
            device.bus = usb
            device.subsystem = video4linux
            device.vendor.id = 046d
            device.vendor.name = 046d
            device.product.id = 08e5
            device.product.name = "HD\ Pro\ Webcam\ C920"
            device.serial = 046d_HD_Pro_Webcam_C920
            device.capabilities = :capture:
            device.api = v4l2
            device.path = /dev/video2
            v4l2.device.driver = uvcvideo
            v4l2.device.card = "HD\ Pro\ Webcam\ C920"
            v4l2.device.bus_info = usb-xhci-hcd.0.auto-1.3
            v4l2.device.version = 330402 (0x00050aa2)
            v4l2.device.capabilities = 2225078273 (0x84a00001)
            v4l2.device.device_caps = 69206017 (0x04200001)
    gst-launch-1.0 v4l2src device=/dev/video2 ! ...

`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video2');
            assert.equal(devices[0].name, 'HD Pro Webcam C920 (/dev/video2)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 15,
                    formats: []
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 20,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 432,
                    height: 240,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: []
                },
                {
                    type: "image/jpeg",
                    width: 160,
                    height: 90,
                    framerate: 30,
                    formats: []
                }

            ]));
        });

        // https://github.com/edgeimpulse/edgeimpulse/issues/9506
        it("nvidia orin w/ basler camera", async () => {
            const gstDeviceMonitorOutput = `

Probing devices...


Device found:

	name  : Monitor of Dummy Output
	class : Audio/Source
	caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	        audio/x-alaw, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	        audio/x-mulaw, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	properties:
		device.description = "Monitor\ of\ Dummy\ Output"
		device.class = monitor
		device.icon_name = audio-input-microphone
		is-default = true
	gst-launch-1.0 pulsesrc device=auto_null.monitor ! ...


Device found:

	name  : Dummy Output
	class : Audio/Sink
	caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	        audio/x-alaw, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	        audio/x-mulaw, rate=(int)[ 1, 384000 ], channels=(int)[ 1, 32 ];
	properties:
		device.description = "Dummy\ Output"
		device.class = abstract
		device.icon_name = audio-card
		is-default = true
	gst-launch-1.0 ... ! pulsesink device=auto_null


`;

            const gstInspectPylonsrcOutput = await fs.readFile('./test/nvidia-orin-w-basler-camera-pylonsrc.txt', { encoding: 'utf-8' });

            const gstInspectOutput = await fs.readFile('./test/nvidia-orin-w-basler-camera-inspect.txt', { encoding: 'utf-8' });

            const gstLaunchPylonsrcOutput = `
Setting pipeline to PAUSED ...
Pipeline is live and does not need PREROLL ...
Setting pipeline to PLAYING ...
New clock: GstSystemClock
Execution ended after 0:00:00.052061116
Setting pipeline to NULL ...
Freeing pipeline ...
            `;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstDeviceMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'pylonsrc') {
                        return gstInspectPylonsrcOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                },
                gstLaunch: (args: string[]) => {
                    if (args[0] === 'pylonsrc') {
                        return gstLaunchPylonsrcOutput;
                    }
                    else if (args[0] === 'nvarguscamerasrc') {
                        return '';
                    }
                    else {
                        throw new Error('Cannot handle gstLaunch command: ' + JSON.stringify(args));
                    }
                }
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, 'pylonsrc');
            assert.equal(devices[0].name, 'Basler camera (pylonsrc)');
            assert.equal(devices[0].videoSource, 'pylonsrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }
            ]));
        });

        it("qualcomm rb3 gen 2 (QIMP Linux 1.2) with Logitech Brio", async () => {
            const gstMonitorOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-qimp-linux-1-2-with-logitech-brio-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-qimp-linux-1-2-with-logitech-brio-inspect.txt', { encoding: 'utf-8' });
            const gstInspectOutputQti = await fs.readFile('./test/qualcomm-rb3-gen-2-qimp-linux-1-2-with-logitech-brio-inspect-qtiqmmfsrc.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'qtiqmmfsrc') {
                        return gstInspectOutputQti;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
            });
            assert.equal(devices.length, 2);
            assert.equal(devices[0].id, '/dev/video2');
            assert.equal(devices[0].name, 'Logitech BRIO (/dev/video2)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([
                {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 540,
                    framerate: 15,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 848,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 440,
                    height: 440,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 480,
                    height: 270,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 340,
                    height: 340,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 424,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 540,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30,
                    formats: [ "YUY2" ]
                }
            ]));

            assert.equal(devices[1].id, '/dev/video4');
            assert.equal(devices[1].name, 'Logitech BRIO (/dev/video4)');
            assert.equal(devices[1].videoSource, 'v4l2src');
        });

        it("triple vision ai industrial camera", async () => {
            const gstMonitorOutput = await fs.readFile('./test/triple-vision-ai-industrial-camera-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/triple-vision-ai-industrial-camera-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: () => gstInspectOutput,
                modeOverride: 'qualcomm-yupik'
            });
            assert.equal(devices.length, 3);
            assert.equal(devices[0].id, '0');
            assert.equal(devices[0].name, 'Camera 0 (0)');
            assert.equal(devices[0].videoSource, 'qtiqmmfsrc');

            assert.equal(devices[1].id, '1');
            assert.equal(devices[1].name, 'Camera 1 (1)');
            assert.equal(devices[1].videoSource, 'qtiqmmfsrc');

            assert.equal(devices[2].id, '2');
            assert.equal(devices[2].name, 'Camera 2 (2)');
            assert.equal(devices[2].videoSource, 'qtiqmmfsrc');
        });

        it("RB1 with debian and libcamera support + logitech c920 webcam", async () => {
            const gstMonitorOutput = await fs.readFile('./test/rb1-debian-libcamera-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/rb1-debian-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: () => gstInspectOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/soc@0/usb@4ef8800/usb@4e00000-1.4:1.0-046d:08e5');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
        });

        it("imx219 csi on arduino unoq", async () => {
            const gstMonitorOutput = await fs.readFile('./test/imx219-csi-on-arduino-unoq-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/imx219-csi-on-arduino-unoq-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: () => gstInspectOutput
            });
            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/soc@0/cci@5c1b000/i2c-bus@0/sensor@10');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
        });

        it("rpi5 with imx500", async () => {
            const gstMonitorOutput = await fs.readFile('./test/rpi5-with-csi-imx500-camera-monitor.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                modeOverride: 'rpi5'
            });
            assert.equal(devices.length, 2);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/axi/pcie@1000120000/rp1/i2c@88000/imx500@1a');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(devices[0].caps[0].formats?.length, 16);
        });

        it("rpi5 with imx708", async () => {
            const gstMonitorOutput = await fs.readFile('./test/rpi5-with-csi-imx708-monitor.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                modeOverride: 'rpi5'
            });
            assert.equal(devices.length, 3);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/axi/pcie@1000120000/rp1/i2c@88000/imx708@1a');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(devices[0].caps[0].formats?.length, 16);
        });

        // Tested locally (Jan)
        it("rpi4 Raspbian GNU/Linux 13 (trixie), CSI camera + USB webcam", async () => {
            const gstMonitorOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-device-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
            });

            assert.equal(devices.length, 3);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/soc/i2c0mux/i2c@1/imx708@1a');
            assert.equal(devices[0].videoSource, 'libcamerasrc');

            assert.equal(devices[1].id, '');
            assert.equal(devices[1].name, '/base/scb/pcie@7d500000/pci@0,0/usb@0,0-1.1:1.0-046d:085c');
            assert.equal(devices[1].videoSource, 'libcamerasrc');

            assert.equal(devices[2].id, '/dev/video2');
            assert.equal(devices[2].name, 'UvcH264 C922 Pro Stream Webcam (/dev/video2)');
            assert.equal(devices[2].videoSource, 'uvch264src');
        });

        // Tested locally (Jan), Macbook Pro w/ built-in webcam, Studio Display, and external CamLink camera
        it("Macbook Pro, built-in webcam, Studio Display, external CamLink", async () => {
            const gstMonitorOutput = await fs.readFile('./test/macbook-pro-w-internal-and-external-cam-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/macbook-pro-w-internal-and-external-cam-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
            });

            assert.equal(devices.length, 3);
            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, 'Cam Link 4K');
            assert.equal(devices[0].videoSource, 'avfvideosrc device-index=0');

            assert.equal(devices[1].id, '');
            assert.equal(devices[1].name, 'Studio Display Camera');
            assert.equal(devices[1].videoSource, 'avfvideosrc device-index=1');

            assert.equal(devices[2].id, '');
            assert.equal(devices[2].name, 'MacBook Pro Camera');
            assert.equal(devices[2].videoSource, 'avfvideosrc device-index=2');
        });
    });


    describe("gstreamer command", () => {
        // https://github.com/edgeimpulse/edgeimpulse/issues/9506
        it("nvidia orin w/ basler camera", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, undefined);

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false');
        });

        it("w/ inference dims #1", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-shortest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videocrop left=180 right=180 top=0 bottom=0 ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it("w/ inference dims #1 + profiling info", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                profiling: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-shortest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                '-m pylonsrc ! video/x-raw,width=1440,height=1080 ! identity name=frame_ready silent=false ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videocrop left=180 right=180 top=0 bottom=0 ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! identity name=resize_done silent=false ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! identity name=jpegenc_done silent=false ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it("w/ inference dims #2", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'squash',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it("w/ inference dims #3", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-longest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false');
        });

        it("w/ inference dims #4", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'squash',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it("w/ inference dims #5 (image/jpeg)", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '/dev/video0',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1920,
                    type: "image/jpeg",
                }],
                videoSource: 'uvch264src',
            }, { width: 1920, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-shortest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'uvch264src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! ' +
                'tee name=t ' +
                    't. ! queue ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! jpegdec ! videoconvert ! videocrop left=420 right=420 top=0 bottom=0 ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it("w/ inference dims #6 (image/jpeg, fit-long)", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '/dev/video0',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1920,
                    type: "image/jpeg",
                }],
                videoSource: 'uvch264src',
            }, { width: 1920, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-longest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'uvch264src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! multifilesink location=resized%05d.jpg post-messages=true sync=false'
            );
        });

        it("w/ inference dims #7 (image/jpeg, fit-long, profiling)", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                profiling: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '/dev/video0',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1920,
                    type: "image/jpeg",
                }],
                videoSource: 'uvch264src',
            }, { width: 1920, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-longest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                '-m uvch264src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! identity name=frame_ready silent=false ! multifilesink location=resized%05d.jpg post-messages=true sync=false'
            );
        });

        it("w/ inference dims #8 (pylonsrc, squash, no rgb buffers)", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                dontOutputRgbBuffers: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: 'pylonsrc',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1440,
                    type: "pylonsrc",
                }],
                videoSource: 'pylonsrc',
            }, { width: 1440, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'squash',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videoscale method=lanczos ! video/x-raw,width=320,height=320 ! ' +
                        'jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false'
            );
        });

        it("w/ inference dims #9 (image/jpeg, dont output rgb buffers)", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                dontOutputRgbBuffers: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '/dev/video0',
                name: 'Basler camera',
                caps: [{
                    framerate: 60,
                    height: 1080,
                    width: 1920,
                    type: "image/jpeg",
                }],
                videoSource: 'uvch264src',
            }, { width: 1920, height: 1080 }, {
                width: 320,
                height: 320,
                resizeMode: 'fit-shortest',
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'uvch264src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! ' +
                'tee name=t ' +
                    't. ! queue ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! jpegdec ! videoconvert ! videocrop left=420 right=420 top=0 bottom=0 ! videoscale method=lanczos ! video/x-raw,width=320,height=320 ! ' +
                        'jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false'
            );
        });

        it("rpi4 Raspbian GNU/Linux 13 (trixie), CSI camera #1, 320x320", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    return 'libcamerasrc';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '',
                name: '/base/soc/i2c0mux/i2c@1/imx708@1a',
                caps: [{
                    "type": "video/x-raw",
                    "width": 1280,
                    "height": 720,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                },
                {
                    "type": "video/x-raw",
                    "width": 1600,
                    "height": 896,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                },
                {
                    "type": "video/x-raw",
                    "width": 1920,
                    "height": 1080,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                }],
                videoSource: 'libcamerasrc',
            }, { width: 320, height: 320 }, undefined);

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'libcamerasrc camera-name="/base/soc/i2c0mux/i2c@1/imx708@1a" ! video/x-raw,width=1280,height=720 ! videoconvert ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false');
        });

        it("rpi4 Raspbian GNU/Linux 13 (trixie), CSI camera #2, 1920x1080", async () => {
            const spawnHelper: SpawnHelperType = async (command: string,
                args: string[],
                opts: {
                    ignoreErrors: boolean,
                    cwd ? : string
                } = {
                    ignoreErrors: false
                }) => {

                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    return 'libcamerasrc';
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand({
                id: '',
                name: '/base/soc/i2c0mux/i2c@1/imx708@1a',
                caps: [{
                    "type": "video/x-raw",
                    "width": 1280,
                    "height": 720,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                },
                {
                    "type": "video/x-raw",
                    "width": 1600,
                    "height": 896,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                },
                {
                    "type": "video/x-raw",
                    "width": 1920,
                    "height": 1080,
                    "framerate": 0,
                    "formats": [
                        "YUY2"
                    ]
                }],
                videoSource: 'libcamerasrc',
            }, { width: 1920, height: 1080 }, undefined);

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.pipeline,
                'libcamerasrc camera-name="/base/soc/i2c0mux/i2c@1/imx708@1a" ! video/x-raw,width=1920,height=1080 ! videoconvert ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false');
        });

        it('rb3 gen2 vision kit (built-in camera #1), no inference dims', async () => {
            const gstMonitorOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-inspect.txt', { encoding: 'utf-8' });
            const gstInspectOutputQti = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-inspect-qtiqmmfsrc.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'qtiqmmfsrc') {
                        return gstInspectOutputQti;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                },
                modeOverride: 'qualcomm-rb3gen2',
            });

            assert.equal(devices.length, 2, `Expected 2 devices (${JSON.stringify(devices)})`);

            const device = devices.find(d => d.name === 'Camera 0 (High-resolution, fisheye, IMX577) (0)');
            assert(device, `Expected device with name "Camera 0 (High-resolution, fisheye, IMX577) (0)" (${JSON.stringify(devices)})`);

            const spawnHelper: SpawnHelperType = async (command: string, args: string[]) => {
                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'qtiqmmfsrc') {
                        return gstInspectOutputQti;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                modeOverride: 'qualcomm-rb3gen2',
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand(
                device,
                { width: 1920, height: 1080 },
                undefined);

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');

            // NV12 here is important!
            assert.equal(launchResp.pipeline,
                'qtiqmmfsrc name=camsrc camera=0 ! video/x-raw,width=1920,height=1080,format=NV12 ! videoconvert ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false');
        });

        it('rb3 gen2 vision kit (built-in camera #1), w/ inference dims (squash)', async () => {
            const gstMonitorOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-inspect.txt', { encoding: 'utf-8' });
            const gstInspectOutputQti = await fs.readFile('./test/qualcomm-rb3-gen-2-ubuntu-no-external-camera-inspect-qtiqmmfsrc.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'qtiqmmfsrc') {
                        return gstInspectOutputQti;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                },
                modeOverride: 'qualcomm-rb3gen2',
            });

            assert.equal(devices.length, 2, `Expected 2 devices (${JSON.stringify(devices)})`);

            const device = devices.find(d => d.name === 'Camera 0 (High-resolution, fisheye, IMX577) (0)');
            assert(device, `Expected device with name "Camera 0 (High-resolution, fisheye, IMX577) (0)" (${JSON.stringify(devices)})`);

            const spawnHelper: SpawnHelperType = async (command: string, args: string[]) => {
                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else if (args[0] === 'qtiqmmfsrc') {
                        return gstInspectOutputQti;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                modeOverride: 'qualcomm-rb3gen2',
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand(device, { width: 1920, height: 1080 }, {
                width: 320, height: 320, resizeMode: 'squash'
            });

            // console.log('launchResp', launchResp);

            assert.equal(launchResp.command, 'gst-launch-1.0');

            // NV12 here is important!
            assert.equal(launchResp.pipeline,
                'qtiqmmfsrc name=camsrc camera=0 ! video/x-raw,width=1920,height=1080,format=NV12 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it('camera with both video/x-raw and image/jpeg, preferCapType=video/x-raw', async () => {
            const gstMonitorOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-device-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                },
            });

            const device = devices.find(d => d.name === 'UvcH264 C922 Pro Stream Webcam (/dev/video2)');
            assert(device, `Expected device with name "UvcH264 C922 Pro Stream Webcam (/dev/video2)" (${JSON.stringify(devices)})`);

            const spawnHelper: SpawnHelperType = async (command: string, args: string[]) => {
                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                preferCapType: 'video/x-raw',
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand(device, { width: 1920, height: 1080 }, {
                width: 320, height: 320, resizeMode: 'squash'
            });

            assert.equal(launchResp.command, 'gst-launch-1.0');

            // Should use video/x-raw caps
            assert.equal(launchResp.pipeline,
                'uvch264src device=/dev/video2 ! video/x-raw,width=1920,height=1080 ! videoconvert ! ' +
                'tee name=t ' +
                    't. ! queue ! jpegenc ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });

        it('camera with both video/x-raw and image/jpeg, preferCapType=image/jpeg', async () => {
            const gstMonitorOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-device-monitor.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/rpi4-trixie-csi-gst-inspect.txt', { encoding: 'utf-8' });

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstMonitorOutput,
                gstInspect: (args: string[]) => {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                },
            });

            const device = devices.find(d => d.name === 'UvcH264 C922 Pro Stream Webcam (/dev/video2)');
            assert(device, `Expected device with name "UvcH264 C922 Pro Stream Webcam (/dev/video2)" (${JSON.stringify(devices)})`);

            const spawnHelper: SpawnHelperType = async (command: string, args: string[]) => {
                if (command === 'which') {
                    return  '';
                }
                else if (command === 'gst-inspect-1.0') {
                    if (args.length === 0) {
                        return gstInspectOutput;
                    }
                    else {
                        throw new Error('Cannot handle gstInspect command: ' + JSON.stringify(args));
                    }
                }
                else {
                    throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
                }
            };

            const gstreamer = new GStreamer(false, {
                spawnHelperOverride: spawnHelper,
                dontRunCleanupLoop: true,
                preferCapType: 'image/jpeg',
            });
            await gstreamer.init();
            const launchResp = await gstreamer.getGstreamerLaunchCommand(device, { width: 1920, height: 1080 }, {
                width: 320, height: 320, resizeMode: 'squash'
            });

            assert.equal(launchResp.command, 'gst-launch-1.0');

            // Should use image/jpeg caps here now
            assert.equal(launchResp.pipeline,
                'uvch264src device=/dev/video2 ! image/jpeg,width=1920,height=1080 ! ' +
                'tee name=t ' +
                    't. ! queue ! multifilesink location=original%05d.jpg post-messages=true sync=false ' +
                    't. ! queue ! jpegdec ! videoconvert ! videoscale method=lanczos ! video/x-raw,format=RGB,width=320,height=320 ! ' +
                        'tee name=u ' +
                            'u. ! queue ! jpegenc ! multifilesink location=resized%05d.jpg post-messages=true sync=false ' +
                            'u. ! queue ! multifilesink location=resized%05d.rgb post-messages=true sync=false'
            );
        });
    });
});

async function testGetDevices(output: {
    which?: (args: string[]) => string,
    gstDeviceMonitor: (args: string[]) => string,
    gstInspect?: (args: string[]) => string,
    gstLaunch?: (args: string[]) => string,
    modeOverride?: GStreamerMode,
}) {
    const spawnHelper: SpawnHelperType = async (command: string,
        args: string[],
        opts: {
            ignoreErrors: boolean,
            cwd ? : string
        } = {
            ignoreErrors: false
        }) => {

        if (command === 'which') {
            return typeof output.which === 'function' ?
                output.which(args) :
                '';
        }
        else if (command === 'gst-device-monitor-1.0') {
            return output.gstDeviceMonitor(args);
        }
        else if (command === 'gst-inspect-1.0') {
            return typeof output.gstInspect === 'function' ?
                output.gstInspect(args) :
                '';
        }
        else if (command === 'gst-launch-1.0') {
            return typeof output.gstLaunch === 'function' ?
                output.gstLaunch(args) :
                '';
        }
        else {
            throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
        }
    };

    const gstreamer = new GStreamer(false, {
        spawnHelperOverride: spawnHelper,
        modeOverride: output?.modeOverride,
        dontRunCleanupLoop: true,
    });
    await gstreamer.init();
    const devices = await gstreamer.getAllDevices();
    return devices;
}
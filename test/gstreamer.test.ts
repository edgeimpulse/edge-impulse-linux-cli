import assert from "assert";
import {
    GStreamer,
    GStreamerMode
} from "../library/sensors/gstreamer";
import {
    SpawnHelperType
} from "../library/sensors/spawn-helper";
import fs from 'node:fs/promises';

describe("gstreamer", () => {
    describe("parse devices", () => {
        // https://forum.edgeimpulse.com/t/error-setting-up-jetson-nano-with-a-csi-camera/1794/28
        it("nvidia jetson w/ csi camera", async () => {
            const gstOutput = `Probing devices...

Device found:

    name  : Monitor of Built-in Audio Analogue Stereo
    class : Audio/Source
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        device.description = "Monitor\ of\ Built-in\ Audio\ Analogue\ Stereo"
        device.class = monitor
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = 1
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 pulsesrc device=alsa_output.platform-sound.analog-stereo.monitor ! ...


Device found:

    name  : Built-in Audio Analogue Stereo
    class : Audio/Source
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = ""
        alsa.id = "ADMAIF1\ CIF\ ADMAIF1-0"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = front:1
        device.buffering.buffer_size = 32768
        device.buffering.fragment_size = 16384
        device.access_mode = mmap+timer
        device.profile.name = analog-stereo
        device.profile.description = "Analogue\ Stereo"
        device.description = "Built-in\ Audio\ Analogue\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 pulsesrc device=alsa_input.platform-sound.analog-stereo ! ...


Device found:

    name  : Built-in Audio Analogue Stereo
    class : Audio/Sink
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = ""
        alsa.id = "ADMAIF1\ CIF\ ADMAIF1-0"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = front:1
        device.buffering.buffer_size = 32768
        device.buffering.fragment_size = 16384
        device.access_mode = mmap+timer
        device.profile.name = analog-stereo
        device.profile.description = "Analogue\ Stereo"
        device.description = "Built-in\ Audio\ Analogue\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 ... ! pulsesink device=alsa_output.platform-sound.analog-stereo`;

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
            const gstOutput = `Probing devices...


Device found:

    name  : C922 Pro Stream Webcam Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "USB\ Audio"
        alsa.id = "USB\ Audio"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 2
        alsa.card_name = "C922\ Pro\ Stream\ Webcam"
        alsa.long_card_name = "C922\ Pro\ Stream\ Webcam\ at\ usb-70090000.xusb-2.1\,\ high\ speed"
        alsa.driver_name = snd_usb_audio
        device.bus_path = platform-70090000.xusb-usb-0:2.1:1.2
        sysfs.path = /devices/70090000.xusb/usb1/1-2/1-2.1/1-2.1:1.2/sound/card2
        udev.id = usb-046d_C922_Pro_Stream_Webcam_C72F6EDF-02
        device.bus = usb
        device.vendor.id = 046d
        device.vendor.name = "Logitech\,\ Inc."
        device.product.id = 085c
        device.product.name = "C922\ Pro\ Stream\ Webcam"
        device.serial = 046d_C922_Pro_Stream_Webcam_C72F6EDF
        device.form_factor = webcam
        device.string = front:2
        device.buffering.buffer_size = 256000
        device.buffering.fragment_size = 128000
        device.access_mode = mmap+timer
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "C922\ Pro\ Stream\ Webcam\ Analog\ Stereo"
        alsa.mixer_name = "USB\ Mixer"
        alsa.components = USB046d:085c
        module-udev-detect.discovered = 1
        device.icon_name = camera-web-usb
    gst-launch-1.0 pulsesrc device=alsa_input.usb-046d_C922_Pro_Stream_Webcam_C72F6EDF-02.analog-stereo ! ...


Device found:

    name  : Monitor of Built-in Audio Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        device.description = "Monitor\ of\ Built-in\ Audio\ Analog\ Stereo"
        device.class = monitor
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = 1
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 pulsesrc device=alsa_output.platform-sound.analog-stereo.monitor ! ...


Device found:

    name  : Built-in Audio Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = ""
        alsa.id = "ADMAIF1\ CIF\ ADMAIF1-0"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = front:1
        device.buffering.buffer_size = 32768
        device.buffering.fragment_size = 16384
        device.access_mode = mmap+timer
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "Built-in\ Audio\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 pulsesrc device=alsa_input.platform-sound.analog-stereo ! ...


Device found:

    name  : Built-in Audio Analog Stereo
    class : Audio/Sink
    caps  : audio/x-raw, format=(string){ S16LE, S16BE, F32LE, F32BE, S32LE, S32BE, S24LE, S24BE, S24_32LE, S24_32BE, U8 }, layout=(string)interleaved, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-alaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
            audio/x-mulaw, rate=(int)[ 1, 2147483647 ], channels=(int)[ 1, 32 ];
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = ""
        alsa.id = "ADMAIF1\ CIF\ ADMAIF1-0"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 1
        alsa.card_name = tegra-snd-t210ref-mobile-rt565x
        alsa.long_card_name = tegra-snd-t210ref-mobile-rt565x
        device.bus_path = platform-sound
        sysfs.path = /devices/sound/sound/card1
        device.form_factor = internal
        device.string = front:1
        device.buffering.buffer_size = 32768
        device.buffering.fragment_size = 16384
        device.access_mode = mmap+timer
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "Built-in\ Audio\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
    gst-launch-1.0 ... ! pulsesink device=alsa_output.platform-sound.analog-stereo


Device found:

    name  : C922 Pro Stream Webcam
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
            image/jpeg, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction){ 60/1, 30/1, 24/1, 20/1, 15/1, 10/1, 15/2, 5/1 };
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
    properties:
        udev-probed = true
        device.bus_path = platform-70090000.xusb-usb-0:2.1:1.0
        sysfs.path = /sys/devices/70090000.xusb/usb1/1-2/1-2.1/1-2.1:1.0/video4linux/video0
        device.bus = usb
        device.subsystem = video4linux
        device.vendor.id = 046d
        device.vendor.name = 046d
        device.product.id = 085c
        device.product.name = "C922\ Pro\ Stream\ Webcam"
        device.serial = 046d_C922_Pro_Stream_Webcam_C72F6EDF
        device.capabilities = :capture:
        device.api = v4l2
        device.path = /dev/video0
        v4l2.device.driver = uvcvideo
        v4l2.device.card = "C922\ Pro\ Stream\ Webcam"
        v4l2.device.bus_info = usb-70090000.xusb-2.1
        v4l2.device.version = 264649 (0x000409c9)
        v4l2.device.capabilities = 2216689665 (0x84200001)
        v4l2.device.device_caps = 69206017 (0x04200001)
    gst-launch-1.0 v4l2src ! ...`;

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
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30
                }
            ]));
        });

        // https://forum.edgeimpulse.com/t/usb-camera-on-raspberry-pi/1758
        it("usb camera on rpi w/ image/jpeg", async () => {
            const gstOutput = `Probing devices...


Device found:

        name  : USB           : USB
        class : Video/Source
        caps  : image/jpeg, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1;
        properties:
                udev-probed = true
                device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.2:1.0
                sysfs.path = /sys/devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.2/1-1.2:1.0/video4linux/video0
                device.bus = usb
                device.subsystem = video4linux
                device.vendor.id = 1b3f
                device.vendor.name = "USB\\x20\\x20\\x20\\x20"
                device.product.id = 2002
                device.product.name = "USB\ \ \ \ \ \ \ \ \ \ \ :\ USB"
                device.serial = USB_USB_Demo_1.00
                device.capabilities = :capture:
                device.api = v4l2
                device.path = /dev/video0
                v4l2.device.driver = uvcvideo
                v4l2.device.card = "USB\ \ \ \ \ \ \ \ \ \ \ :\ USB\ \ \ \ \ \ \ \ \ \ \ \ "
                v4l2.device.bus_info = usb-0000:01:00.0-1.2
                v4l2.device.version = 328787 (0x00050453)
                v4l2.device.capabilities = 2225078273 (0x84a00001)
                v4l2.device.device_caps = 69206017 (0x04200001)
        gst-launch-1.0 v4l2src ! ...


Device found:

        name  : bcm2835-isp
        class : Video/Sink
        caps  : video/x-raw, format=(string)YUY2, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)UYVY, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)I420, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)YV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)BGRA, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], interlace-mode=(string)progressive, colorimetry=(string){ sRGB };
                video/x-raw, format=(string)BGR, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], interlace-mode=(string)progressive, colorimetry=(string){ sRGB };
                video/x-raw, format=(string)RGB, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], interlace-mode=(string)progressive, colorimetry=(string){ sRGB };
                video/x-raw, format=(string)NV21, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)NV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)RGB16, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], interlace-mode=(string)progressive, colorimetry=(string){ sRGB };
                video/x-bayer, format=(string)grbg, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], colorimetry=(string){ 1:1:0:0 };
                video/x-bayer, format=(string)gbrg, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], colorimetry=(string){ 1:1:0:0 };
                video/x-bayer, format=(string)rggb, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], colorimetry=(string){ 1:1:0:0 };
                video/x-bayer, format=(string)bggr, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], colorimetry=(string){ 1:1:0:0 };
                video/x-raw, format=(string)GRAY8, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ 2:0:0:0 };
                video/x-raw, format=(string)YVYU, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ bt601 };
                video/x-raw, format=(string)GRAY16_LE, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], interlace-mode=(string)progressive, colorimetry=(string){ 2:0:0:0 };
        properties:
                udev-probed = true
                device.bus_path = platform-bcm2835-isp
                sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video13
                device.subsystem = video4linux
                device.product.name = bcm2835-isp
                device.capabilities = :video_output:
                device.api = v4l2
                device.path = /dev/video13
                v4l2.device.driver = bcm2835-isp
                v4l2.device.card = bcm2835-isp
                v4l2.device.bus_info = platform:bcm2835-isp
                v4l2.device.version = 328787 (0x00050453)
                v4l2.device.capabilities = 2216689666 (0x84200002)
                v4l2.device.device_caps = 69206018 (0x04200002)
        gst-launch-1.0 ... ! v4l2sink device=/dev/video13


Device found:

        name  : bcm2835-isp
        class : Video/Source
        caps  : video/x-raw, format=(string)YUY2, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)UYVY, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)I420, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)YV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)BGRA, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)BGR, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)RGB, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)NV21, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)NV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)RGB16, width=(int)[ 64, 16384 ], height=(int)[ 64, 16384 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)YVYU, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
        properties:
                udev-probed = true
                device.bus_path = platform-bcm2835-isp
                sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video14
                device.subsystem = video4linux
                device.product.name = bcm2835-isp
                device.capabilities = :capture:
                device.api = v4l2
                device.path = /dev/video14
                v4l2.device.driver = bcm2835-isp
                v4l2.device.card = bcm2835-isp
                v4l2.device.bus_info = platform:bcm2835-isp
                v4l2.device.version = 328787 (0x00050453)
                v4l2.device.capabilities = 2216689665 (0x84200001)
                v4l2.device.device_caps = 69206017 (0x04200001)
        gst-launch-1.0 v4l2src device=/dev/video14 ! ...


Device found:

        name  : bcm2835-isp
        class : Video/Source
        caps  : video/x-raw, format=(string)YUY2, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)UYVY, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)I420, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)YV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)NV21, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)NV12, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
                video/x-raw, format=(string)YVYU, width=(int)[ 64, 16384, 2 ], height=(int)[ 64, 16384, 2 ], framerate=(fraction)[ 0/1, 2147483647/1 ];
        properties:
                udev-probed = true
                device.bus_path = platform-bcm2835-isp
                sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video15
                device.subsystem = video4linux
                device.product.name = bcm2835-isp
                device.capabilities = :capture:
                device.api = v4l2
                device.path = /dev/video15
                v4l2.device.driver = bcm2835-isp
                v4l2.device.card = bcm2835-isp
                v4l2.device.bus_info = platform:bcm2835-isp
                v4l2.device.version = 328787 (0x00050453)
                v4l2.device.capabilities = 2216689665 (0x84200001)
                v4l2.device.device_caps = 69206017 (0x04200001)
        gst-launch-1.0 v4l2src device=/dev/video15 ! ...`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 3);

            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'USB (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                type: "image/jpeg",
                width: 1280,
                height: 720,
                framerate: 30
            }]));

            assert.equal(devices[1].id, '/dev/video14');
            assert.equal(devices[1].name, 'bcm2835-isp (/dev/video14)');
            assert.equal(devices[1].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));

            assert.equal(devices[2].id, '/dev/video15');
            assert.equal(devices[2].name, 'bcm2835-isp (/dev/video15)');
            assert.equal(devices[2].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[2].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));
        });

        it("rpi cam v3 c920 webcam bookworm no libcamerasrc", async () => {
            const gstOutput = `Probing devices...


Device found:

	name  : HD Pro Webcam C920
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=2560, height=1472, pixel-aspect-ratio=1/1, framerate=2/1
	        video/x-raw, format=YUY2, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate=5/1
	        video/x-raw, format=YUY2, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        video/x-raw, format=YUY2, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	        image/jpeg, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
	properties:
		udev-probed = true
		device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.3:1.0
		sysfs.path = /sys/devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.3/1-1.3:1.0/video4linux/video2
		device.bus = usb
		device.subsystem = video4linux
		device.vendor.id = 046d
		device.vendor.name = 046d
		device.product.id = 08e5
		device.product.name = HD Pro Webcam C920
		device.serial = 046d_HD_Pro_Webcam_C920
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video2
		v4l2.device.driver = uvcvideo
		v4l2.device.card = HD Pro Webcam C920
		v4l2.device.bus_info = usb-0000:01:00.0-1.3
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2225078273 (0x84a00001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video2 ! ...


Device found:

	name  : bcm2835-isp
	class : Video/Sink
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:7:1, (string)bt601, (string)bt709, (string)1:3:5:1 }
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:7:1, (string)bt601, (string)bt709, (string)1:3:5:1 }
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-bayer, format=grbg, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=gbrg, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=rggb, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=bggr, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-raw, format=GRAY8, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:1:0 }
	        video/x-raw(format:Interlaced), format=GRAY8, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:1:0 }
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=GRAY16_LE, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:1:0 }
	        video/x-raw(format:Interlaced), format=GRAY16_LE, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:1:0 }
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video13
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :video_output:
		device.api = v4l2
		device.path = /dev/video13
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689666 (0x84200002)
		v4l2.device.device_caps = 69206018 (0x04200002)
	gst-launch-1.0 ... ! v4l2sink device=/dev/video13


Device found:

	name  : bcm2835-isp
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video14
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video14
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video14 ! ...


Device found:

	name  : bcm2835-isp
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video15
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video15
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video15 ! ...


Device found:

	name  : bcm2835-isp
	class : Video/Sink
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:7:1, (string)bt601, (string)bt709, (string)1:3:5:1 }
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:7:1, (string)bt601, (string)bt709, (string)1:3:5:1 }
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=progressive, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-raw(format:Interlaced), format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], interlace-mode=alternate, colorimetry={ (string)sRGB, (string)2:1:16:4, (string)2:1:5:1, (string)1:1:5:1 }
	        video/x-bayer, format=grbg, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=gbrg, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=rggb, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-bayer, format=bggr, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], colorimetry={ (string)1:1:1:0 }
	        video/x-raw, format=GRAY8, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:1:0 }
	        video/x-raw(format:Interlaced), format=GRAY8, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:1:0 }
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)bt601, (string)bt709, (string)1:3:5:1, (string)1:4:7:1 }
	        video/x-raw, format=GRAY16_LE, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=progressive, colorimetry={ (string)1:4:1:0 }
	        video/x-raw(format:Interlaced), format=GRAY16_LE, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], interlace-mode=alternate, colorimetry={ (string)1:4:1:0 }
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video20
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :video_output:
		device.api = v4l2
		device.path = /dev/video20
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689666 (0x84200002)
		v4l2.device.device_caps = 69206018 (0x04200002)
	gst-launch-1.0 ... ! v4l2sink device=/dev/video20


Device found:

	name  : bcm2835-isp
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGRx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGBx, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGR, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB16, width=[ 64, 16384 ], height=[ 64, 16384 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video21
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video21
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video21 ! ...


Device found:

	name  : bcm2835-isp
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=I420, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YV12, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=NV21, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 64, 16384, 2 ], height=[ 64, 16384, 2 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	properties:
		udev-probed = true
		device.bus_path = platform-bcm2835-isp
		sysfs.path = /sys/devices/platform/soc/fe00b840.mailbox/bcm2835-isp/video4linux/video22
		device.subsystem = video4linux
		device.product.name = bcm2835-isp
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video22
		v4l2.device.driver = bcm2835-isp
		v4l2.device.card = bcm2835-isp
		v4l2.device.bus_info = platform:bcm2835-isp
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video22 ! ...


Device found:

	name  : unicam
	class : Video/Source
	caps  : video/x-raw, format=YUY2, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YUY2, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=UYVY, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=UYVY, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=xRGB, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=xRGB, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGR, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGR, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=BGR15, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=BGR15, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB15, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB15, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=RGB16, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=RGB16, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-bayer, format=rggb, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-bayer, format=grbg, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-bayer, format=gbrg, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-bayer, format=bggr, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw, format=GRAY8, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=GRAY8, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=GRAY16_LE, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=GRAY16_LE, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	        video/x-raw, format=YVYU, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ]
	        video/x-raw(format:Interlaced), format=YVYU, width=[ 16, 16376 ], height=[ 16, 16376 ], framerate=[ 0/1, 2147483647/1 ], interlace-mode=alternate
	properties:
		udev-probed = true
		device.bus_path = platform-fe801000.csi
		sysfs.path = /sys/devices/platform/soc/fe801000.csi/video4linux/video0
		device.subsystem = video4linux
		device.product.name = unicam
		device.capabilities = :capture:
		device.api = v4l2
		device.path = /dev/video0
		v4l2.device.driver = unicam
		v4l2.device.card = unicam
		v4l2.device.bus_info = platform:fe801000.csi
		v4l2.device.version = 394803 (0x00060633)
		v4l2.device.capabilities = 2778726401 (0xa5a00001)
		v4l2.device.device_caps = 622854145 (0x25200001)
	gst-launch-1.0 v4l2src ! ...`;

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
                    framerate: 2
                }, {
                    type: 'video/x-raw',
                    width: 1920,
                    height: 1080,
                    framerate: 5
                }, {
                    type: 'video/x-raw',
                    width: 1600,
                    height: 896,
                    framerate: 15
                }, {
                    type: 'video/x-raw',
                    width: 1280,
                    height: 720,
                    framerate: 10
                }, {
                    type: 'video/x-raw',
                    width: 960,
                    height: 720,
                    framerate: 15
                },
                { type: 'video/x-raw', width: 1024, height: 576, framerate: 15 }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 600,
                    framerate: 24
                },
                { type: 'video/x-raw', width: 864, height: 480, framerate: 24 }, {
                    type: 'video/x-raw',
                    width: 800,
                    height: 448,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 480,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 640,
                    height: 360,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 432,
                    height: 240,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 352,
                    height: 288,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 240,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 320,
                    height: 180,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 176,
                    height: 144,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 160,
                    height: 120,
                    framerate: 30
                }, {
                    type: 'video/x-raw',
                    width: 160,
                    height: 90,
                    framerate: 30
                },
                { type: 'image/jpeg', width: 1920, height: 1080, framerate: 30 }, {
                    type: 'image/jpeg',
                    width: 1600,
                    height: 896,
                    framerate: 30
                }, {
                    type: 'image/jpeg',
                    width: 1280,
                    height: 720,
                    framerate: 30
                }, {
                    type: 'image/jpeg',
                    width: 960,
                    height: 720,
                    framerate: 30
                }, {
                    type: 'image/jpeg',
                    width: 1024,
                    height: 576,
                    framerate: 30
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 600,
                    framerate: 30
                }, {
                    type: 'image/jpeg',
                    width: 864,
                    height: 480,
                    framerate: 30
                }

             ]));

            assert.equal(devices[1].id, '/dev/video14');
            assert.equal(devices[1].name, 'bcm2835-isp (/dev/video14)');
            assert.equal(devices[1].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));

            assert.equal(devices[2].id, '/dev/video15');
            assert.equal(devices[2].name, 'bcm2835-isp (/dev/video15)');
            assert.equal(devices[2].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[2].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));

            assert.equal(devices[3].id, '/dev/video21');
            assert.equal(devices[3].name, 'bcm2835-isp (/dev/video21)');
            assert.equal(devices[3].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[4].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));

            assert.equal(devices[4].id, '/dev/video22');
            assert.equal(devices[4].name, 'bcm2835-isp (/dev/video22)');
            assert.equal(devices[4].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[4].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 64,
                height: 64,
                framerate: 0
            }]));

            assert.equal(devices[5].id, '/dev/video0');
            assert.equal(devices[5].name, 'unicam (/dev/video0)');
            assert.equal(devices[5].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[5].caps), JSON.stringify([{
                type: "video/x-raw",
                width: 16,
                height: 16,
                framerate: 0
            }]));

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
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 720,
                    height: 480,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30
                }
            ]));
        });

        // https://forum.edgeimpulse.com/t/raspberry-pi-4-logitech-c922-error/3160/3
        it("logitech c922 on rpi bullseye", async () => {
            const gstOutput = `Probing devices...

 Device found:

    name  : /base/scb/pcie@7d500000/pci@0,0/usb@0,0-1.2:1.0-046d:085c
    class : Source/Video
    caps  : image/jpeg, width=160, height=90
            image/jpeg, width=160, height=120
            image/jpeg, width=176, height=144
            image/jpeg, width=320, height=180
            image/jpeg, width=320, height=240
            image/jpeg, width=352, height=288
            image/jpeg, width=432, height=240
            image/jpeg, width=640, height=360
            image/jpeg, width=640, height=480
            image/jpeg, width=800, height=448
            image/jpeg, width=864, height=480
            image/jpeg, width=800, height=600
            image/jpeg, width=1024, height=576
            image/jpeg, width=960, height=720
            image/jpeg, width=1280, height=720
            image/jpeg, width=1600, height=896
            image/jpeg, width=1920, height=1080
            video/x-raw, format=YUY2, width=160, height=90
            video/x-raw, format=YUY2, width=160, height=120
            video/x-raw, format=YUY2, width=176, height=144
            video/x-raw, format=YUY2, width=320, height=180
            video/x-raw, format=YUY2, width=320, height=240
            video/x-raw, format=YUY2, width=352, height=288
            video/x-raw, format=YUY2, width=432, height=240
            video/x-raw, format=YUY2, width=640, height=360
            video/x-raw, format=YUY2, width=640, height=480
            video/x-raw, format=YUY2, width=800, height=448
            video/x-raw, format=YUY2, width=864, height=480
            video/x-raw, format=YUY2, width=800, height=600
            video/x-raw, format=YUY2, width=1024, height=576
            video/x-raw, format=YUY2, width=960, height=720
            video/x-raw, format=YUY2, width=1280, height=720
            video/x-raw, format=YUY2, width=1600, height=896
            video/x-raw, format=YUY2, width=1920, height=1080
            video/x-raw, format=YUY2, width=2304, height=1296
            video/x-raw, format=YUY2, width=2304, height=1536
    gst-launch-1.0 libcamerasrc camera-name="/base/scb/pcie\@7d500000/pci\@0\,0/usb\@0\,0-1.2:1.0-046d:085c" ! ...


Device found:

    name  : C922 Pro Stream Webcam Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "USB\ Audio"
        alsa.id = "USB\ Audio"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 1
        alsa.card_name = "C922\ Pro\ Stream\ Webcam"
        alsa.long_card_name = "C922\ Pro\ Stream\ Webcam\ at\ usb-0000:01:00.0-1.2\,\ high\ speed"
        alsa.driver_name = snd_usb_audio
        device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.2:1.2
        sysfs.path = /devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.2/1-1.2:1.2/sound/card1
        udev.id = usb-046d_C922_Pro_Stream_Webcam_8BECCCDF-02
        device.bus = usb
        device.vendor.id = 046d
        device.vendor.name = "Logitech\,\ Inc."
        device.product.id = 085c
        device.product.name = "C922\ Pro\ Stream\ Webcam"
        device.serial = 046d_C922_Pro_Stream_Webcam_8BECCCDF
        device.form_factor = webcam
        device.string = front:1
        device.buffering.buffer_size = 7672
        device.buffering.fragment_size = 1916
        device.access_mode = mmap
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "C922\ Pro\ Stream\ Webcam\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = camera-web-usb
        is-default = true
    gst-launch-1.0 pulsesrc device=alsa_input.usb-046d_C922_Pro_Stream_Webcam_8BECCCDF-02.analog-stereo ! ...


Device found:

    name  : Monitor of Built-in Audio Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        device.description = "Monitor\ of\ Built-in\ Audio\ Analog\ Stereo"
        device.class = monitor
        alsa.card = 0
        alsa.card_name = "bcm2835\ Headphones"
        alsa.long_card_name = "bcm2835\ Headphones"
        alsa.driver_name = snd_bcm2835
        device.bus_path = platform-bcm2835_audio
        sysfs.path = /devices/platform/soc/fe00b840.mailbox/bcm2835_audio/sound/card0
        device.form_factor = internal
        device.string = 0
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = false
    gst-launch-1.0 pulsesrc device=alsa_output.platform-bcm2835_audio.analog-stereo.monitor ! ...


Device found:

    name  : Monitor of Built-in Audio Digital Stereo (HDMI)
    class : Audio/Source
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        device.description = "Monitor\ of\ Built-in\ Audio\ Digital\ Stereo\ \(HDMI\)"
        device.class = monitor
        alsa.card = 2
        alsa.card_name = vc4-hdmi-0
        alsa.long_card_name = vc4-hdmi-0
        alsa.driver_name = vc4
        device.bus_path = platform-fef00700.hdmi
        sysfs.path = /devices/platform/soc/fef00700.hdmi/sound/card2
        device.form_factor = internal
        device.string = 2
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = false
    gst-launch-1.0 pulsesrc device=alsa_output.platform-fef00700.hdmi.hdmi-stereo.monitor ! ...


Device found:

    name  : Built-in Audio Analog Stereo
    class : Audio/Sink
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "bcm2835\ Headphones"
        alsa.id = "bcm2835\ Headphones"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 0
        alsa.card_name = "bcm2835\ Headphones"
        alsa.long_card_name = "bcm2835\ Headphones"
        alsa.driver_name = snd_bcm2835
        device.bus_path = platform-bcm2835_audio
        sysfs.path = /devices/platform/soc/fe00b840.mailbox/bcm2835_audio/sound/card0
        device.form_factor = internal
        device.string = hw:0
        device.buffering.buffer_size = 10576
        device.buffering.fragment_size = 2640
        device.access_mode = mmap
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "Built-in\ Audio\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = true
    gst-launch-1.0 ... ! pulsesink device=alsa_output.platform-bcm2835_audio.analog-stereo


Device found:

    name  : Built-in Audio Digital Stereo (HDMI)
    class : Audio/Sink
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "MAI\ PCM\ i2s-hifi-0"
        alsa.id = "MAI\ PCM\ i2s-hifi-0"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 2
        alsa.card_name = vc4-hdmi-0
        alsa.long_card_name = vc4-hdmi-0
        alsa.driver_name = vc4
        device.bus_path = platform-fef00700.hdmi
        sysfs.path = /devices/platform/soc/fef00700.hdmi/sound/card2
        device.form_factor = internal
        device.string = hdmi:2
        device.buffering.buffer_size = 10576
        device.buffering.fragment_size = 2644
        device.access_mode = mmap
        device.profile.name = hdmi-stereo
        device.profile.description = "Digital\ Stereo\ \(HDMI\)"
        device.description = "Built-in\ Audio\ Digital\ Stereo\ \(HDMI\)"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = false
    gst-launch-1.0 ... ! pulsesink device=alsa_output.platform-fef00700.hdmi.hdmi-stereo


Device found:

    name  : UvcH264 Video Capture 4
    class : Video/CameraSource
    caps  : video/x-raw, format=YUY2, width=2304, height=1536, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=2304, height=1296, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate=5/1
            video/x-raw, format=YUY2, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)60/1, (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
    properties:
        device.path = /dev/video0
        udev-probed = false
        device.api = uvch264
        v4l2.device.driver = uvcvideo
        v4l2.device.card = "Video\ Capture\ 4"
        v4l2.device.bus_info = usb-0000:01:00.0-1.2
        v4l2.device.version = 330321 (0x00050a51)
        v4l2.device.capabilities = 2225078273 (0x84a00001)
        v4l2.device.device_caps = 69206017 (0x04200001)
        device.is-camerasrc = true
    gst-launch-1.0 uvch264src.vfsrc name=camerasrc ! ... camerasrc.vidsrc ! [video/x-h264] ...


Device found:

    name  : UvcH264 Video Capture 4
    class : Video/CameraSource
    caps  : video/x-raw, format=YUY2, width=2304, height=1536, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=2304, height=1296, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate=5/1
            video/x-raw, format=YUY2, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)60/1, (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
    properties:
        udev-probed = true
        device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.2:1.0
        sysfs.path = /sys/devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.2/1-1.2:1.0/video4linux/video0
        device.bus = usb
        device.subsystem = video4linux
        device.vendor.id = 046d
        device.vendor.name = 046d
        device.product.id = 085c
        device.product.name = "Video\ Capture\ 4"
        device.serial = 046d_C922_Pro_Stream_Webcam_8BECCCDF
        device.capabilities = :capture:
        device.api = uvch264
        device.path = /dev/video0
        v4l2.device.driver = uvcvideo
        v4l2.device.card = "Video\ Capture\ 4"
        v4l2.device.bus_info = usb-0000:01:00.0-1.2
        v4l2.device.version = 330321 (0x00050a51)
        v4l2.device.capabilities = 2225078273 (0x84a00001)
        v4l2.device.device_caps = 69206017 (0x04200001)
        device.is-camerasrc = true
    gst-launch-1.0 uvch264src.vfsrc name=camerasrc ! ... camerasrc.vidsrc ! [video/x-h264] ...

`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 2);


            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/scb/pcie@7d500000/pci@0,0/usb@0,0-1.2');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "image/jpeg",
                    width: 160,
                    height: 90,
                    framerate: 0
                }, {
                    type: "image/jpeg",
                    width: 160,
                    height: 120,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 176,
                    height: 144,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 320,
                    height: 180,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 320,
                    height: 240,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 352,
                    height: 288,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 432,
                    height: 240,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 640,
                    height: 360,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 640,
                    height: 480,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 448,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 864,
                    height: 480,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 600,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1024,
                    height: 576,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 960,
                    height: 720,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1280,
                    height: 720,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1600,
                    height: 896,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1920,
                    height: 1080,
                    framerate: 0
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1296,
                    framerate: 0
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1536,
                    framerate: 0
                }]));

            assert.equal(devices[1].id, '/dev/video0');
            assert.equal(devices[1].name, 'UvcH264 Video Capture 4 (/dev/video0)');
            assert.equal(devices[1].videoSource, 'uvch264src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([{
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30
                }
            ]));
        });

        it("logitech c920 on ubuntu 22 parallells", async () => {
            const gstOutput = `Probing devices...
            Device found:
                name  : HD Pro Webcam C920
                class : Video/Source
                caps  : video/x-raw, format=YUY2, width=640, height=480, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=160, height=90, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=160, height=120, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=176, height=144, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=320, height=180, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=320, height=240, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=352, height=288, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=432, height=240, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=640, height=360, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=800, height=448, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=800, height=600, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=864, height=480, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=960, height=720, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=1024, height=576, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=1280, height=720, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        video/x-raw, format=YUY2, width=1600, height=896, framerate={ (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=640, height=480, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=160, height=90, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=160, height=120, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=176, height=144, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=320, height=180, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=320, height=240, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=352, height=288, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=432, height=240, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=640, height=360, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=800, height=448, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=800, height=600, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=864, height=480, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=960, height=720, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=1024, height=576, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=1280, height=720, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=1600, height=896, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                        image/jpeg, width=1920, height=1080, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
                properties:
                    object.path = v4l2:/dev/video0
                    device.api = v4l2
                    media.class = Video/Source
                    device.product.id = 2277
                    device.vendor.id = 1133
                    api.v4l2.path = /dev/video0
                    api.v4l2.cap.driver = uvcvideo
                    api.v4l2.cap.card = "HD\ Pro\ Webcam\ C920"
                    api.v4l2.cap.bus_info = usb-0000:00:1d.7-14
                    api.v4l2.cap.version = 6.5.13
                    api.v4l2.cap.capabilities = 84a00001
                    api.v4l2.cap.device-caps = 04200001
                    device.id = 33
                    node.name = v4l2_input.pci-0000_00_1d.7-usb-0_14_1.0.2
                    node.description = "HD\ Pro\ Webcam\ C920"
                    factory.name = api.v4l2.source
                    node.pause-on-idle = false
                    factory.id = 10
                    client.id = 32
                    clock.quantum-limit = 8192
                    media.role = Camera
                    node.driver = true
                    object.id = 35
                    object.serial = 40
                gst-launch-1.0 pipewiresrc path=35 ! ...
            Device found:
                name  : Monitor of Built-in Audio Analog Stereo
                class : Audio/Source
                caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                properties:
                    device.description = "Monitor\ of\ Built-in\ Audio\ Analog\ Stereo"
                    device.class = monitor
                    alsa.card = 0
                    alsa.card_name = "Intel\ 82801BA-ICH2"
                    alsa.long_card_name = "Intel\ 82801BA-ICH2\ with\ ALC850\ at\ irq\ 17"
                    alsa.driver_name = snd_intel8x0
                    device.bus_path = pci-0000:00:1f.4
                    sysfs.path = /devices/pci0000:00/0000:00:1f.4/sound/card0
                    device.bus = pci
                    device.vendor.id = 8086
                    device.vendor.name = "Intel\ Corporation"
                    device.product.id = 2445
                    device.product.name = "82801BA/BAM\ AC\'97\ Audio\ Controller"
                    device.form_factor = internal
                    device.string = 0
                    module-udev-detect.discovered = 1
                    device.icon_name = audio-card-pci
                    is-default = false
                gst-launch-1.0 pulsesrc device=alsa_output.pci-0000_00_1f.4.analog-stereo.monitor ! ...
            Device found:
                name  : Built-in Audio Analog Stereo
                class : Audio/Source
                caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                properties:
                    alsa.resolution_bits = 16
                    device.api = alsa
                    device.class = sound
                    alsa.class = generic
                    alsa.subclass = generic-mix
                    alsa.name = "Intel\ 82801BA-ICH2"
                    alsa.id = "Intel\ ICH"
                    alsa.subdevice = 0
                    alsa.subdevice_name = "subdevice\ \#0"
                    alsa.device = 0
                    alsa.card = 0
                    alsa.card_name = "Intel\ 82801BA-ICH2"
                    alsa.long_card_name = "Intel\ 82801BA-ICH2\ with\ ALC850\ at\ irq\ 17"
                    alsa.driver_name = snd_intel8x0
                    device.bus_path = pci-0000:00:1f.4
                    sysfs.path = /devices/pci0000:00/0000:00:1f.4/sound/card0
                    device.bus = pci
                    device.vendor.id = 8086
                    device.vendor.name = "Intel\ Corporation"
                    device.product.id = 2445
                    device.product.name = "82801BA/BAM\ AC\'97\ Audio\ Controller"
                    device.form_factor = internal
                    device.string = front:0
                    device.buffering.buffer_size = 17632
                    device.buffering.fragment_size = 4408
                    device.access_mode = mmap
                    device.profile.name = analog-stereo
                    device.profile.description = "Analog\ Stereo"
                    device.description = "Built-in\ Audio\ Analog\ Stereo"
                    module-udev-detect.discovered = 1
                    device.icon_name = audio-card-pci
                    is-default = false
                gst-launch-1.0 pulsesrc device=alsa_input.pci-0000_00_1f.4.analog-stereo ! ...
            Device found:
                name  : HD Pro Webcam C920 Analog Stereo
                class : Audio/Source
                caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                properties:
                    alsa.resolution_bits = 16
                    device.api = alsa
                    device.class = sound
                    alsa.class = generic
                    alsa.subclass = generic-mix
                    alsa.name = "USB\ Audio"
                    alsa.id = "USB\ Audio"
                    alsa.subdevice = 0
                    alsa.subdevice_name = "subdevice\ \#0"
                    alsa.device = 0
                    alsa.card = 1
                    alsa.card_name = "HD\ Pro\ Webcam\ C920"
                    alsa.long_card_name = "HD\ Pro\ Webcam\ C920\ at\ usb-0000:00:1d.7-14\,\ high\ speed"
                    alsa.driver_name = snd_usb_audio
                    device.bus_path = pci-0000:00:1d.7-usb-0:14:1.2
                    sysfs.path = /devices/pci0000:00/0000:00:1d.7/usb1/1-14/1-14:1.2/sound/card1
                    udev.id = usb-046d_HD_Pro_Webcam_C920_0D7DE91F-02
                    device.bus = usb
                    device.vendor.id = 046d
                    device.vendor.name = "Logitech\,\ Inc."
                    device.product.id = 08e5
                    device.product.name = "HD\ Pro\ Webcam\ C920"
                    device.serial = 046d_HD_Pro_Webcam_C920_0D7DE91F
                    device.form_factor = webcam
                    device.string = front:1
                    device.buffering.buffer_size = 12792
                    device.buffering.fragment_size = 3196
                    device.access_mode = mmap
                    device.profile.name = analog-stereo
                    device.profile.description = "Analog\ Stereo"
                    device.description = "HD\ Pro\ Webcam\ C920\ Analog\ Stereo"
                    module-udev-detect.discovered = 1
                    device.icon_name = camera-web-usb
                    is-default = true
                gst-launch-1.0 pulsesrc device=alsa_input.usb-046d_HD_Pro_Webcam_C920_0D7DE91F-02.analog-stereo ! ...
            Device found:
                name  : Built-in Audio Analog Stereo
                class : Audio/Sink
                caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                        audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
                properties:
                    alsa.resolution_bits = 16
                    device.api = alsa
                    device.class = sound
                    alsa.class = generic
                    alsa.subclass = generic-mix
                    alsa.name = "Intel\ 82801BA-ICH2"
                    alsa.id = "Intel\ ICH"
                    alsa.subdevice = 0
                    alsa.subdevice_name = "subdevice\ \#0"
                    alsa.device = 0
                    alsa.card = 0
                    alsa.card_name = "Intel\ 82801BA-ICH2"
                    alsa.long_card_name = "Intel\ 82801BA-ICH2\ with\ ALC850\ at\ irq\ 17"
                    alsa.driver_name = snd_intel8x0
                    device.bus_path = pci-0000:00:1f.4
                    sysfs.path = /devices/pci0000:00/0000:00:1f.4/sound/card0
                    device.bus = pci
                    device.vendor.id = 8086
                    device.vendor.name = "Intel\ Corporation"
                    device.product.id = 2445
                    device.product.name = "82801BA/BAM\ AC\'97\ Audio\ Controller"
                    device.form_factor = internal
                    device.string = front:0
                    device.buffering.buffer_size = 17632
                    device.buffering.fragment_size = 4408
                    device.access_mode = mmap
                    device.profile.name = analog-stereo
                    device.profile.description = "Analog\ Stereo"
                    device.description = "Built-in\ Audio\ Analog\ Stereo"
                    module-udev-detect.discovered = 1
                    device.icon_name = audio-card-pci
                    is-default = true
                gst-launch-1.0 ... ! pulsesink device=alsa_output.pci-0000_00_1f.4.analog-stereo
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
            });

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'HD Pro Webcam C920 (/dev/video0)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([
                {
                   "type":"video/x-raw",
                   "width":640,
                   "height":480,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":160,
                   "height":90,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":160,
                   "height":120,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":176,
                   "height":144,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":320,
                   "height":180,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":320,
                   "height":240,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":352,
                   "height":288,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":432,
                   "height":240,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":640,
                   "height":360,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":800,
                   "height":448,
                   "framerate":30
                },
                {
                   "type":"video/x-raw",
                   "width":800,
                   "height":600,
                   "framerate":24
                },
                {
                   "type":"video/x-raw",
                   "width":864,
                   "height":480,
                   "framerate":24
                },
                {
                   "type":"video/x-raw",
                   "width":960,
                   "height":720,
                   "framerate":15
                },
                {
                   "type":"video/x-raw",
                   "width":1024,
                   "height":576,
                   "framerate":15
                },
                {
                   "type":"video/x-raw",
                   "width":1280,
                   "height":720,
                   "framerate":10
                },
                {
                   "type":"video/x-raw",
                   "width":1600,
                   "height":896,
                   "framerate":15
                },
                {
                   "type":"image/jpeg",
                   "width":800,
                   "height":600,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":864,
                   "height":480,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":960,
                   "height":720,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":1024,
                   "height":576,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":1280,
                   "height":720,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":1600,
                   "height":896,
                   "framerate":30
                },
                {
                   "type":"image/jpeg",
                   "width":1920,
                   "height":1080,
                   "framerate":30
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
                    framerate: 2
                },
                {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2
                },
                {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5
                },
                {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10
                },
                {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24
                },
                {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24
                },
                {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30
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
                framerate: 0
            }]));
        });

        // Tested locally (Jan)
        it("logitech c922 on rpi bullseye #2", async () => {
            const gstOutput = `Probing devices...

[1698:57:08.508902920] [22184]  INFO Camera camera_manager.cpp:293 libcamera v0.0.0+3156-f4070274

Device found:

    name  : /base/scb/pcie@7d500000/pci@1,0/usb@1,0-1.1:1.0-046d:085c
    class : Source/Video
    caps  : image/jpeg, width=160, height=90
            image/jpeg, width=160, height=120
            image/jpeg, width=176, height=144
            image/jpeg, width=320, height=180
            image/jpeg, width=320, height=240
            image/jpeg, width=352, height=288
            image/jpeg, width=432, height=240
            image/jpeg, width=640, height=360
            image/jpeg, width=640, height=480
            image/jpeg, width=800, height=448
            image/jpeg, width=864, height=480
            image/jpeg, width=800, height=600
            image/jpeg, width=1024, height=576
            image/jpeg, width=960, height=720
            image/jpeg, width=1280, height=720
            image/jpeg, width=1600, height=896
            image/jpeg, width=1920, height=1080
            video/x-raw, format=YUY2, width=160, height=90
            video/x-raw, format=YUY2, width=160, height=120
            video/x-raw, format=YUY2, width=176, height=144
            video/x-raw, format=YUY2, width=320, height=180
            video/x-raw, format=YUY2, width=320, height=240
            video/x-raw, format=YUY2, width=352, height=288
            video/x-raw, format=YUY2, width=432, height=240
            video/x-raw, format=YUY2, width=640, height=360
            video/x-raw, format=YUY2, width=640, height=480
            video/x-raw, format=YUY2, width=800, height=448
            video/x-raw, format=YUY2, width=864, height=480
            video/x-raw, format=YUY2, width=800, height=600
            video/x-raw, format=YUY2, width=1024, height=576
            video/x-raw, format=YUY2, width=960, height=720
            video/x-raw, format=YUY2, width=1280, height=720
            video/x-raw, format=YUY2, width=1600, height=896
            video/x-raw, format=YUY2, width=1920, height=1080
            video/x-raw, format=YUY2, width=2304, height=1296
            video/x-raw, format=YUY2, width=2304, height=1536
    gst-launch-1.0 libcamerasrc camera-name="/base/scb/pcie\@7d500000/pci\@1\,0/usb\@1\,0-1.1:1.0-046d:085c" ! ...


Device found:

    name  : Monitor of Built-in Audio Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        device.description = "Monitor\ of\ Built-in\ Audio\ Analog\ Stereo"
        device.class = monitor
        alsa.card = 0
        alsa.card_name = "bcm2835\ Headphones"
        alsa.long_card_name = "bcm2835\ Headphones"
        alsa.driver_name = snd_bcm2835
        device.bus_path = platform-bcm2835_audio
        sysfs.path = /devices/platform/soc/fe00b840.mailbox/bcm2835_audio/sound/card0
        device.form_factor = internal
        device.string = 0
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = false
    gst-launch-1.0 pulsesrc device=alsa_output.platform-bcm2835_audio.analog-stereo.monitor ! ...


Device found:

    name  : C922 Pro Stream Webcam Analog Stereo
    class : Audio/Source
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "USB\ Audio"
        alsa.id = "USB\ Audio"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 3
        alsa.card_name = "C922\ Pro\ Stream\ Webcam"
        alsa.long_card_name = "C922\ Pro\ Stream\ Webcam\ at\ usb-0000:01:00.0-1.1\,\ high\ speed"
        alsa.driver_name = snd_usb_audio
        device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.1:1.2
        sysfs.path = /devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.1/1-1.1:1.2/sound/card3
        udev.id = usb-046d_C922_Pro_Stream_Webcam_C72F6EDF-02
        device.bus = usb
        device.vendor.id = 046d
        device.vendor.name = "Logitech\,\ Inc."
        device.product.id = 085c
        device.product.name = "C922\ Pro\ Stream\ Webcam"
        device.serial = 046d_C922_Pro_Stream_Webcam_C72F6EDF
        device.form_factor = webcam
        device.string = front:3
        device.buffering.buffer_size = 7672
        device.buffering.fragment_size = 1916
        device.access_mode = mmap
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "C922\ Pro\ Stream\ Webcam\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = camera-web-usb
        is-default = true
    gst-launch-1.0 pulsesrc device=alsa_input.usb-046d_C922_Pro_Stream_Webcam_C72F6EDF-02.analog-stereo ! ...


Device found:

    name  : Built-in Audio Analog Stereo
    class : Audio/Sink
    caps  : audio/x-raw, format={ (string)S16LE, (string)S16BE, (string)F32LE, (string)F32BE, (string)S32LE, (string)S32BE, (string)S24LE, (string)S24BE, (string)S24_32LE, (string)S24_32BE, (string)U8 }, layout=interleaved, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-alaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
            audio/x-mulaw, rate=[ 1, 384000 ], channels=[ 1, 32 ]
    properties:
        alsa.resolution_bits = 16
        device.api = alsa
        device.class = sound
        alsa.class = generic
        alsa.subclass = generic-mix
        alsa.name = "bcm2835\ Headphones"
        alsa.id = "bcm2835\ Headphones"
        alsa.subdevice = 0
        alsa.subdevice_name = "subdevice\ \#0"
        alsa.device = 0
        alsa.card = 0
        alsa.card_name = "bcm2835\ Headphones"
        alsa.long_card_name = "bcm2835\ Headphones"
        alsa.driver_name = snd_bcm2835
        device.bus_path = platform-bcm2835_audio
        sysfs.path = /devices/platform/soc/fe00b840.mailbox/bcm2835_audio/sound/card0
        device.form_factor = internal
        device.string = hw:0
        device.buffering.buffer_size = 10576
        device.buffering.fragment_size = 2640
        device.access_mode = mmap
        device.profile.name = analog-stereo
        device.profile.description = "Analog\ Stereo"
        device.description = "Built-in\ Audio\ Analog\ Stereo"
        module-udev-detect.discovered = 1
        device.icon_name = audio-card
        is-default = true
    gst-launch-1.0 ... ! pulsesink device=alsa_output.platform-bcm2835_audio.analog-stereo


Device found:

    name  : UvcH264 C922 Pro Stream Webcam
    class : Video/CameraSource
    caps  : video/x-raw, format=YUY2, width=2304, height=1536, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=2304, height=1296, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate=5/1
            video/x-raw, format=YUY2, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)60/1, (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
    properties:
        device.path = /dev/video0
        udev-probed = false
        device.api = uvch264
        v4l2.device.driver = uvcvideo
        v4l2.device.card = "C922\ Pro\ Stream\ Webcam"
        v4l2.device.bus_info = usb-0000:01:00.0-1.1
        v4l2.device.version = 330303 (0x00050a3f)
        v4l2.device.capabilities = 2225078273 (0x84a00001)
        v4l2.device.device_caps = 69206017 (0x04200001)
        device.is-camerasrc = true
    gst-launch-1.0 uvch264src.vfsrc name=camerasrc ! ... camerasrc.vidsrc ! [video/x-h264] ...


Device found:

    name  : UvcH264 C922 Pro Stream Webcam
    class : Video/CameraSource
    caps  : video/x-raw, format=YUY2, width=2304, height=1536, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=2304, height=1296, pixel-aspect-ratio=1/1, framerate=2/1
            video/x-raw, format=YUY2, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate=5/1
            video/x-raw, format=YUY2, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            video/x-raw, format=YUY2, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1920, height=1080, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1600, height=896, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1280, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)60/1, (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=960, height=720, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=1024, height=576, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=600, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=864, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=800, height=448, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=480, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=640, height=360, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=432, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=352, height=288, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=240, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=320, height=180, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=176, height=144, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=120, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
            image/jpeg, width=160, height=90, pixel-aspect-ratio=1/1, framerate={ (fraction)30/1, (fraction)24/1, (fraction)20/1, (fraction)15/1, (fraction)10/1, (fraction)15/2, (fraction)5/1 }
    properties:
        udev-probed = true
        device.bus_path = platform-fd500000.pcie-pci-0000:01:00.0-usb-0:1.1:1.0
        sysfs.path = /sys/devices/platform/scb/fd500000.pcie/pci0000:00/0000:00:00.0/0000:01:00.0/usb1/1-1/1-1.1/1-1.1:1.0/video4linux/video0
        device.bus = usb
        device.subsystem = video4linux
        device.vendor.id = 046d
        device.vendor.name = 046d
        device.product.id = 085c
        device.product.name = "C922\ Pro\ Stream\ Webcam"
        device.serial = 046d_C922_Pro_Stream_Webcam_C72F6EDF
        device.capabilities = :capture:
        device.api = uvch264
        device.path = /dev/video0
        v4l2.device.driver = uvcvideo
        v4l2.device.card = "C922\ Pro\ Stream\ Webcam"
        v4l2.device.bus_info = usb-0000:01:00.0-1.1
        v4l2.device.version = 330303 (0x00050a3f)
        v4l2.device.capabilities = 2225078273 (0x84a00001)
        v4l2.device.device_caps = 69206017 (0x04200001)
        device.is-camerasrc = true
    gst-launch-1.0 uvch264src.vfsrc name=camerasrc ! ... camerasrc.vidsrc ! [video/x-h264] ...
`;

            const devices = await testGetDevices({
                gstDeviceMonitor: () => gstOutput,
                modeOverride: 'rpi'
            });

            assert.equal(devices.length, 2);


            assert.equal(devices[0].id, '');
            assert.equal(devices[0].name, '/base/scb/pcie@7d500000/pci@1,0/usb@1,0-1.1');
            assert.equal(devices[0].videoSource, 'libcamerasrc');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                    type: "image/jpeg",
                    width: 160,
                    height: 90,
                    framerate: 0
                }, {
                    type: "image/jpeg",
                    width: 160,
                    height: 120,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 176,
                    height: 144,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 320,
                    height: 180,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 320,
                    height: 240,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 352,
                    height: 288,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 432,
                    height: 240,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 640,
                    height: 360,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 640,
                    height: 480,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 448,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 864,
                    height: 480,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 800,
                    height: 600,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1024,
                    height: 576,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 960,
                    height: 720,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1280,
                    height: 720,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1600,
                    height: 896,
                    framerate: 0
                }, {
                    type: 'image/jpeg',
                    width: 1920,
                    height: 1080,
                    framerate: 0
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1296,
                    framerate: 0
                }, {
                    type: 'video/x-raw',
                    width: 2304,
                    height: 1536,
                    framerate: 0
                }]));

            assert.equal(devices[1].id, '/dev/video0');
            assert.equal(devices[1].name, 'UvcH264 C922 Pro Stream Webcam (/dev/video0)');
            assert.equal(devices[1].videoSource, 'uvch264src');
            assert.equal(JSON.stringify(devices[1].caps), JSON.stringify([
                {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1536,
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 2304,
                    height: 1296,
                    framerate: 2
                }, {
                    type: "video/x-raw",
                    width: 1920,
                    height: 1080,
                    framerate: 5
                }, {
                    type: "video/x-raw",
                    width: 1600,
                    height: 896,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 10
                }, {
                    type: "video/x-raw",
                    width: 960,
                    height: 720,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 1024,
                    height: 576,
                    framerate: 15
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 600,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 864,
                    height: 480,
                    framerate: 24
                }, {
                    type: "video/x-raw",
                    width: 800,
                    height: 448,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 480,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 640,
                    height: 360,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 432,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 352,
                    height: 288,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 240,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 320,
                    height: 180,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 176,
                    height: 144,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 30
                }, {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1920,
                    height: 1080,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1600,
                    height: 896,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1280,
                    height: 720,
                    framerate: 60
                }, {
                    type: "image/jpeg",
                    width: 960,
                    height: 720,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 1024,
                    height: 576,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 800,
                    height: 600,
                    framerate: 30
                }, {
                    type: "image/jpeg",
                    width: 864,
                    height: 480,
                    framerate: 30
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
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 120,
                    framerate: 15
                },
                {
                    type: "video/x-raw",
                    width: 160,
                    height: 90,
                    framerate: 20
                },
                {
                    type: "image/jpeg",
                    width: 640,
                    height: 480,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 640,
                    height: 360,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 432,
                    height: 240,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 352,
                    height: 288,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 320,
                    height: 240,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 320,
                    height: 180,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 176,
                    height: 144,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 160,
                    height: 120,
                    framerate: 30
                },
                {
                    type: "image/jpeg",
                    width: 160,
                    height: 90,
                    framerate: 30
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

            const gstInspectPylonsrcOutput = `Factory Details:
  Rank                     none (0)
  Long-name                Basler/Pylon source element
  Klass                    Source/Video/Hardware
  Description              Source element for Basler cameras
  Author                   Basler AG <support.europe@baslerweb.com>

Plugin Details:
  Name                     pylon
  Description              Basler/Pylon plugin for pylon SDK 7.4.0(38864)
  Filename                 /usr/lib/aarch64-linux-gnu/gstreamer-1.0/libgstpylon.so
  Version                  0.7.0-15-g86e4ccf
  License                  BSD
  Source module            gst-plugin-pylon
  Binary package           GStreamer Pylon Plug-in source release
  Origin URL               https://github.com/basler/gst-plugin-pylon

GObject
 +----GInitiallyUnowned
       +----GstObject
             +----GstElement
                   +----GstBaseSrc
                         +----GstPushSrc
                               +----GstPylonSrc

Implemented Interfaces:
  GstChildProxy

Pad Templates:
  SRC template: 'src'
    Availability: Always
    Capabilities:
      video/x-raw
                 format: { (string)GRAY8, (string)RGB, (string)BGR, (string)YUY2, (string)UYVY }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]
      video/x-bayer
                 format: { (string)rggb, (string)bggr, (string)gbgr, (string)grgb }
                  width: [ 1, 2147483647 ]
                 height: [ 1, 2147483647 ]
              framerate: [ 0/1, 2147483647/1 ]

Element has no clocking capabilities.
Element has no URI handling capabilities.

Pads:
  SRC: 'src'
    Pad Template: 'src'

Element Properties:
  blocksize           : Size in bytes to read per buffer (-1 = default)
                        flags: readable, writable
                        Unsigned Integer. Range: 0 - 4294967295 Default: 4096
  cam                 : The camera to use.
			According to the selected camera different properties will be available.
 			These properties can be accessed using the "cam::<property>" syntax.
			The following list details the properties for each camera.
    Basler acA1440-220um (40407253) Camera:

                                   name                               : The name of the object
                                                                        flags: readable, writable
                                                                        String. Default: "(null)"
                                   parent                             : The parent of the object
                                                                        flags: readable, writable
                                                                        (null)
                                   SensorWidth                        : Width of the camera's sensor in pixels.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 1456
                                   SensorHeight                       : Height of the camera's sensor in pixels.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 1088
                                   WidthMax                           : Maximum width of the region of interest (area of interest) in pixels.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 1456
                                   HeightMax                          : Maximum height of the region of interest (area of interest) in pixels.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 1088
                                   OffsetX                            : Horizontal offset of the region of interest (area of interest) from the left side of the sensor (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1452 Default: 8
                                   OffsetY                            : Vertical offset of the region of interest (area of interest) from the top of the sensor (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1087 Default: 4
                                   CenterX                            : Centers the image horizontally.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   CenterY                            : Centers the image vertically.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   BinningHorizontalMode              : Sets the binning mode for horizontal binning.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_BinningHorizontalMode" Default: 0, "Sum"
                                                                           (0): Sum                - The values of the binned pixels are summed.
                                                                           (1): Average            - The values of the binned pixels are averaged.
                                   BinningHorizontal                  : Number of adjacent horizontal pixels to be summed.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 4 Default: 1
                                   BinningVerticalMode                : Sets the binning mode for vertical binning.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_BinningVerticalMode" Default: 0, "Sum"
                                                                           (0): Sum                - The values of the binned pixels are summed.
                                                                           (1): Average            - The values of the binned pixels are averaged.
                                   BinningVertical                    : Number of adjacent vertical pixels to be summed.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 4 Default: 1
                                   ReverseX                           : Enables horizontal mirroring of the image.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   ReverseY                           : Enables vertical mirroring of the image.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   PixelSize                          : Indicates the depth of the pixel values in the image (in bits per pixel).
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_PixelSize" Default: 8, "Bpp8"
                                                                           (8): Bpp8               - The pixel depth in the acquired images is 8 bits per pixel.
                                                                           (10): Bpp10              - The pixel depth in the acquired images is 10 bits per pixel.
                                                                           (12): Bpp12              - The pixel depth in the acquired images is 12 bits per pixel.
                                                                           (16): Bpp16              - The pixel depth in the acquired images is 16 bits per pixel.
                                                                           (24): Bpp24              - The pixel depth in the acquired images is 24 bits per pixel.
                                   PixelColorFilter                   : Indicates the alignment of the camera's Bayer filter to the pixels in the acquired images.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_PixelColorFilter" Default: 0, "None"
                                                                           (0): None               - The camera doesn't have a Bayer filter.
                                                                           (1): BayerRG            - The Bayer filter has an RG/GB alignment to the pixels in the acquired images.
                                                                           (2): BayerGB            - The Bayer filter has a GB/RG alignment to the pixels in the acquired images.
                                                                           (3): BayerGR            - The Bayer filter has a GR/BG alignment to the pixels in the acquired images.
                                                                           (4): BayerBG            - The Bayer filter has a BG/GR alignment to the pixels in the acquired images.
                                   PixelDynamicRangeMin               : Minimum possible pixel value that can be transferred from the camera.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   PixelDynamicRangeMax               : Maximum possible pixel value that can be transferred from the camera.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 255
                                   TestImageSelector                  : Sets the test image to display.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TestImageSelector" Default: 0, "Off"
                                                                           (0): Off                - The camera doesn't display a test image.
                                                                           (1): Testimage1         - The camera generates a test image with the test image 1 pattern.
                                                                           (2): Testimage2         - The camera generates a test image with the test image 2 pattern.
                                                                           (3): Testimage3         - The camera generates a test image with the test image 3 pattern.
                                                                           (4): Testimage4         - The camera generates a test image with the test image 4 pattern.
                                                                           (5): Testimage5         - The camera generates a test image with the test image 5 pattern.
                                   TestImageResetAndHold              : Allows you to turn a moving test image into a fixed one.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   ROIZoneMode-Zone0                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone1                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone2                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone3                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone4                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone5                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone6                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneMode-Zone7                  : Enables or disables the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ROIZoneMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected ROI zone is disabled.
                                                                           (1): On                 - The currently selected ROI zone is enabled.
                                   ROIZoneSize-Zone0                  : Height of the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 4 - 1088 Default: 4
                                   ROIZoneSize-Zone1                  : Height of the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 4 - 1088 Default: 4
                                   ROIZoneOffset-Zone0                : Vertical offset of the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 0 - 1084 Default: 0
                                   ROIZoneOffset-Zone1                : Vertical offset of the currently selected ROI zone.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 0 - 1084 Default: 0
                                   GainAuto                           : Sets the operation mode of the Gain Auto auto function.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_GainAuto" Default: 0, "Off"
                                                                           (0): Off                - Automatic gain adjustment is disabled.
                                                                           (1): Once               - The gain is adjusted automatically to reach the specifed target value.
                                                                           (2): Continuous         - The gain is adjusted continuously while images are being acquired.
                                   Gain                               : Value of the currently selected gain in dB.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 48 Default: 0
                                   BlackLevel                         : Black level value to be applied to the currently selected sensor tap.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 4.1e+03 Default: 0
                                   Gamma                              : Gamma correction to be applied.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 4 Default: 1
                                   DigitalShift                       : Digital shift to be applied.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4 Default: 0
                                   AcquisitionMode                    : Sets the image acquisition mode.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_AcquisitionMode" Default: 2, "Continuous"
                                                                           (0): SingleFrame        - The acquisition mode is set to Single Frame.
                                                                           (2): Continuous         - The acquisition mode is set to Continuous.
                                   ShutterMode                        : Sets the shutter mode of the camera.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_ShutterMode" Default: 2, "Global"
                                                                           (2): Global             - The shutter opens and closes at the same time for all pixels.
                                   ExposureAuto                       : Sets the operation mode of the Exposure Auto auto function.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_ExposureAuto" Default: 0, "Off"
                                                                           (0): Off                - Automatic exposure time adjustment is disabled.
                                                                           (1): Once               - The exposure time is adjusted automatically to reach the specified target value.
                                                                           (2): Continuous         - The exposure time is adjusted continuously while images are being acquired.
                                   ExposureTimeMode                   : Sets the exposure time mode.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_ExposureTimeMode" Default: 0, "Standard"
                                                                           (0): Standard           - The exposure time mode is set to Standard.
                                                                           (1): UltraShort         - The exposure time mode is set to Ultra Short.
                                   ExposureMode                       : Sets the exposure mode.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_ExposureMode" Default: 1, "Timed"
                                                                           (1): Timed              - The exposure mode is set to Timed.
                                   ExposureTime                       : Exposure time of the camera in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 1 - 1e+07 Default: 3e+03
                                   AcquisitionBurstFrameCount         : Number of frames to acquire for each Frame Burst Start trigger.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 255 Default: 1
                                   TriggerMode-FrameBurstStart        : Sets the mode for the currently selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected trigger is turned off.
                                                                           (1): On                 - The currently selected trigger is turned on.
                                   TriggerMode-FrameStart             : Sets the mode for the currently selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerMode" Default: 0, "Off"
                                                                           (0): Off                - The currently selected trigger is turned off.
                                                                           (1): On                 - The currently selected trigger is turned on.
                                   TriggerSource-FrameBurstStart      : Sets the source signal for the selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerSource" Default: 1, "Line1"
                                                                           (0): Software           - The source signal for the selected trigger is set to software triggering.
                                                                           (1): Line1              - The source signal for the selected trigger is set to Line 1.
                                                                           (3): Line3              - The source signal for the selected trigger is set to Line 3.
                                                                           (4): Line4              - The source signal for the selected trigger is set to Line 4.
                                                                           (15): SoftwareSignal1    - The source signal for the selected trigger is set to software signal 1.
                                                                           (16): SoftwareSignal2    - The source signal for the selected trigger is set to software signal 2.
                                                                           (17): SoftwareSignal3    - The source signal for the selected trigger is set to software signal 3.
                                   TriggerSource-FrameStart           : Sets the source signal for the selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerSource" Default: 1, "Line1"
                                                                           (0): Software           - The source signal for the selected trigger is set to software triggering.
                                                                           (1): Line1              - The source signal for the selected trigger is set to Line 1.
                                                                           (3): Line3              - The source signal for the selected trigger is set to Line 3.
                                                                           (4): Line4              - The source signal for the selected trigger is set to Line 4.
                                                                           (15): SoftwareSignal1    - The source signal for the selected trigger is set to software signal 1.
                                                                           (16): SoftwareSignal2    - The source signal for the selected trigger is set to software signal 2.
                                                                           (17): SoftwareSignal3    - The source signal for the selected trigger is set to software signal 3.
                                   TriggerActivation-FrameBurstStart  : Sets the type of signal transition that will activate the selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerActivation" Default: 0, "RisingEdge"
                                                                           (0): RisingEdge         - The selected trigger is activated by the rising edge of the source signal.
                                                                           (1): FallingEdge        - The selected trigger is activated by the falling edge of the source signal.
                                   TriggerActivation-FrameStart       : Sets the type of signal transition that will activate the selected trigger.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TriggerActivation" Default: 0, "RisingEdge"
                                                                           (0): RisingEdge         - The selected trigger is activated by the rising edge of the source signal.
                                                                           (1): FallingEdge        - The selected trigger is activated by the falling edge of the source signal.
                                   TriggerDelay                       : Trigger delay time in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 1e+06 Default: 0
                                   ResultingFrameRate                 : Maximum frame acquisition rate with current camera settings.
                                                                        flags: readable
                                                                        Double. Range: -1.8e+308 - 1.8e+308 Default: 2.3e+02
                                   SensorReadoutTime                  : Sensor readout time with current settings.
                                                                        flags: readable
                                                                        Double. Range: -1.8e+308 - 1.8e+308 Default: 4.4e+03
                                   AcquisitionStatus-FrameBurstTriggerWait: Indicates whether the camera is waiting for trigger signals.
                                                                        flags: readable
                                                                        Boolean. Default: false
                                   AcquisitionStatus-FrameTriggerWait : Indicates whether the camera is waiting for trigger signals.
                                                                        flags: readable
                                                                        Boolean. Default: false
                                   AutoTargetBrightness               : Target brightness for the Gain Auto and the Exposure Auto auto functions.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0.2 - 0.8 Default: 0.5
                                   AutoFunctionProfile                : Sets how gain and exposure time will be balanced when the camera is making automatic adjustments.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_AutoFunctionProfile" Default: 0, "MinimizeGain"
                                                                           (0): MinimizeGain       - Gain is kept as low as possible.
                                                                           (1): MinimizeExposureTime - Exposure time is kept as low as possible.
                                   AutoGainLowerLimit                 : Lower limit of the Gain parameter when the Gain Auto auto function is active.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 36 Default: 0
                                   AutoGainUpperLimit                 : Upper limit of the Gain parameter when the Gain Auto auto function is active.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 48 Default: 24
                                   AutoExposureTimeLowerLimit         : Lower limit of the Exposure Time parameter when the Exposure Auto auto function is active.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 21 - 1e+07 Default: 50
                                   AutoExposureTimeUpperLimit         : Upper limit of the Exposure Time parameter when the Exposure Auto auto function is active.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 21 - 1e+07 Default: 5e+05
                                   LUTEnable                          : Enables the selected lookup table (LUT).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   LineMode-Line1                     : Sets the mode for the selected line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_LineMode" Default: 0, "Input"
                                                                           (0): Input              - The selected physical line can be used to input an electrical signal.
                                   LineMode-Line2                     : Sets the mode for the selected line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_LineMode" Default: 0, "Input"
                                                                           (0): Input              - The selected physical line can be used to input an electrical signal.
                                   LineMode-Line3                     : Sets the mode for the selected line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_LineMode" Default: 0, "Input"
                                                                           (0): Input              - The selected physical line can be used to input an electrical signal.
                                   LineMode-Line4                     : Sets the mode for the selected line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_LineMode" Default: 0, "Input"
                                                                           (0): Input              - The selected physical line can be used to input an electrical signal.
                                   LineFormat-Line1                   : Indicates the electrical configuration of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineFormat" Default: 5, "OptoCoupled"
                                                                           (5): OptoCoupled        - The line is opto-coupled.
                                   LineFormat-Line2                   : Indicates the electrical configuration of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineFormat" Default: 5, "OptoCoupled"
                                                                           (5): OptoCoupled        - The line is opto-coupled.
                                   LineFormat-Line3                   : Indicates the electrical configuration of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineFormat" Default: 5, "OptoCoupled"
                                                                           (5): OptoCoupled        - The line is opto-coupled.
                                   LineFormat-Line4                   : Indicates the electrical configuration of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineFormat" Default: 5, "OptoCoupled"
                                                                           (5): OptoCoupled        - The line is opto-coupled.
                                   LineLogic-Line1                    : Indicates the line logic of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineLogic" Default: 0, "Positive"
                                                                           (0): Positive           - The line logic of the currently selected line is positive.
                                                                           (1): Negative           - The line logic of the currently selected line is negative.
                                   LineLogic-Line2                    : Indicates the line logic of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineLogic" Default: 0, "Positive"
                                                                           (0): Positive           - The line logic of the currently selected line is positive.
                                                                           (1): Negative           - The line logic of the currently selected line is negative.
                                   LineLogic-Line3                    : Indicates the line logic of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineLogic" Default: 0, "Positive"
                                                                           (0): Positive           - The line logic of the currently selected line is positive.
                                                                           (1): Negative           - The line logic of the currently selected line is negative.
                                   LineLogic-Line4                    : Indicates the line logic of the currently selected line.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_LineLogic" Default: 0, "Positive"
                                                                           (0): Positive           - The line logic of the currently selected line is positive.
                                                                           (1): Negative           - The line logic of the currently selected line is negative.
                                   LineInverter-Line1                 : Enables the signal inverter function for the currently selected input or output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   LineInverter-Line2                 : Enables the signal inverter function for the currently selected input or output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   LineInverter-Line3                 : Enables the signal inverter function for the currently selected input or output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   LineInverter-Line4                 : Enables the signal inverter function for the currently selected input or output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   LineDebouncerTime-Line1            : Line debouncer time in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 2e+04 Default: 0
                                   LineDebouncerTime-Line3            : Line debouncer time in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 2e+04 Default: 0
                                   LineDebouncerTime-Line4            : Line debouncer time in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 2e+04 Default: 0
                                   LineMinimumOutputPulseWidth-Line2  : Minimum signal width of an output signal (in microseconds).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 1e+02 Default: 0
                                   LineStatus-Line1                   : Indicates the current logical state of the selected line.
                                                                        flags: readable
                                                                        Boolean. Default: true
                                   LineStatus-Line2                   : Indicates the current logical state of the selected line.
                                                                        flags: readable
                                                                        Boolean. Default: true
                                   LineStatus-Line3                   : Indicates the current logical state of the selected line.
                                                                        flags: readable
                                                                        Boolean. Default: true
                                   LineStatus-Line4                   : Indicates the current logical state of the selected line.
                                                                        flags: readable
                                                                        Boolean. Default: true
                                   LineStatusAll                      : Single bit field indicating the current logical state of all available line signals at time of polling.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 14
                                   UserOutputValue-UserOutput1        : Enables the selected user-settable output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   UserOutputValue-UserOutput2        : Enables the selected user-settable output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   UserOutputValue-UserOutput3        : Enables the selected user-settable output line.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   UserOutputValueAll                 : Single bit field that sets the state of all user-settable output signals in one access.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   TimerDuration                      : Duration of the currently selected timer in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 1.7e+07 Default: 10
                                   TimerDelay                         : Delay of the currently selected timer in microseconds.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Double. Range: 0 - 1.7e+07 Default: 0
                                   TimerTriggerSource                 : Sets the internal camera signal used to trigger the selected timer.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_TimerTriggerSource" Default: 0, "ExposureStart"
                                                                           (0): ExposureStart      - The timer will start at an Exposure Start signal.
                                   CounterEventSource-Counter1        : Sets which event that increases the currently selected counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterEventSource" Default: 5, "FrameStart"
                                                                           (5): FrameStart         - The selected counter counts the number of Frame Start events.
                                   CounterEventSource-Counter2        : Sets which event that increases the currently selected counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterEventSource" Default: 5, "FrameStart"
                                                                           (5): FrameStart         - The selected counter counts the number of Frame Start events.
                                   CounterResetSource-Counter1        : Sets which source signal will reset the currently selected counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterResetSource" Default: 0, "Off"
                                                                           (0): Off                - The counter reset is disabled.
                                                                           (3): Software           - The selected counter can be reset by a software command.
                                                                           (1): Line1              - The selected counter can be reset by a signal applied to Line 1.
                                                                           (4): Line3              - The selected counter can be reset by a signal applied to Line 3.
                                                                           (5): Line4              - The selected counter can be reset by a signal applied to Line 4.
                                   CounterResetSource-Counter2        : Sets which source signal will reset the currently selected counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterResetSource" Default: 0, "Off"
                                                                           (0): Off                - The counter reset is disabled.
                                                                           (3): Software           - The selected counter can be reset by a software command.
                                                                           (1): Line1              - The selected counter can be reset by a signal applied to Line 1.
                                                                           (4): Line3              - The selected counter can be reset by a signal applied to Line 3.
                                                                           (5): Line4              - The selected counter can be reset by a signal applied to Line 4.
                                   CounterResetActivation-Counter1    : Sets which type of signal transition will reset the counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterResetActivation" Default: 0, "RisingEdge"
                                                                           (0): RisingEdge         - The counter is reset on the rising edge of the signal.
                                   CounterResetActivation-Counter2    : Sets which type of signal transition will reset the counter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_CounterResetActivation" Default: 0, "RisingEdge"
                                                                           (0): RisingEdge         - The counter is reset on the rising edge of the signal.
                                   CounterDuration-Counter2           : Number of times a sequencer set is used before the Counter End event is generated.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 1 - 256 Default: 1
                                   BslLightControlMode                : Enables/disables the light control features.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_BslLightControlMode" Default: 0, "Off"
                                                                           (0): Off                - The light control features are disabled.
                                                                           (1): On                 - The light control features are enabled.
                                   BslLightControlSource              : Sets which line is used to control the light features.
                                                                        flags: readable, writable
                                                                        Enum "_2676_ba02_2_3_5_BslLightControlSource" Default: 0, "Off"
                                                                           (0): Off                - No line is used to control the light features.
                                                                           (1): Line3              - Line 3 is used to control the light features.
                                                                           (2): Line4              - Line 4 is used to control the light features.
                                   BslLightControlStatus              : Indicates the current state of the control mode.
                                                                        flags: readable, writable
                                                                        Enum "_2676_ba02_2_3_5_BslLightControlStatus" Default: 0, "Off"
                                                                           (0): Off                - The light control mode is disabled.
                                                                           (1): Idle               - No light device has been detected.
                                                                           (2): Searching          - The controller ist searching for light devices connected to your camera.
                                                                           (3): Updating           - Parameters are being updated.
                                                                           (4): Ready              - The light device is ready for use.
                                   BslLightControlErrorStatus         : Indicates whether any of the light devices are currently experiencing problems.
                                                                        flags: readable, writable
                                                                        Enum "_2676_ba02_2_3_5_BslLightControlErrorStatus" Default: 0, "NoError"
                                                                           (0): NoError            - No error was detected.
                                                                           (1): Device1            - Light device 1 is experiencing problems.
                                                                           (2): Device2            - Light device 2 is experiencing problems.
                                                                           (3): Device3            - Light device 3 is experiencing problems.
                                                                           (4): Device4            - Light device 4 is experiencing problems.
                                                                           (5): MultipleDevices    - Multiple light devices are experiencing problems.
                                   BslLightControlTriggerMode         : Sets which signal is used to trigger the light in strobe mode.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_BslLightControlTriggerMode" Default: 0, "ExposureActive"
                                                                           (0): ExposureActive     - The Exposure Active signal is used to trigger the light in strobe mode.
                                   ChunkModeActive                    : Enables the chunk mode.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-Gain                   : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-ExposureTime           : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-Timestamp              : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-LineStatusAll          : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-CounterValue           : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-SequencerSetActive     : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   ChunkEnable-PayloadCRC16           : Includes the currently selected chunk in the payload data.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Boolean. Default: false
                                   UserSetDefault                     : Sets the user set or the factory set to be used as the startup set.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Enum "_2676_ba02_2_3_5_UserSetDefault" Default: 0, "Default"
                                                                           (0): Default            - The Default User Set factory set is set as the default startup set.
                                                                           (8): HighGain           - The High Gain factory set is set as the default startup set.
                                                                           (9): AutoFunctions      - The Auto Functions factory set is set as the default startup set.
                                                                           (1): UserSet1           - User set 1 is set as the default startup set.
                                                                           (2): UserSet2           - User set 2 is set as the default startup set.
                                                                           (3): UserSet3           - User set 3 is set as the default startup set.
                                   PayloadSize                        : Size of the payload in bytes.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 9223372036854775807 Default: 1555200
                                   BslUSBSpeedMode                    : Indicates the speed mode of the USB port.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_BslUSBSpeedMode" Default: 8, "SuperSpeed"
                                                                           (4): HighSpeed          - The USB port is operating at High Speed.
                                                                           (8): SuperSpeed         - The USB port is operating at SuperSpeed.
                                   SIPayloadTransferSize              : For information only. May be required when contacting Basler support.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   SIPayloadTransferCount             : For information only. May be required when contacting Basler support.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   SIPayloadFinalTransfer1Size        : For information only. May be required when contacting Basler support.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   SIPayloadFinalTransfer2Size        : For information only. May be required when contacting Basler support.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   DeviceVendorName                   : Name of the camera vendor.
                                                                        flags: readable
                                                                        String. Default: "Basler"
                                   DeviceModelName                    : Model name of the camera.
                                                                        flags: readable
                                                                        String. Default: "acA1440-220um"
                                   DeviceManufacturerInfo             : Additional information from the vendor about the camera.
                                                                        flags: readable
                                                                        String. Default: "none"
                                   DeviceVersion                      : Version of the camera.
                                                                        flags: readable
                                                                        String. Default: "107652-13"
                                   DeviceFirmwareVersion              : Version of the camera's firmware.
                                                                        flags: readable
                                                                        String. Default: "107652-13;U;acA1440_220um;V1.5-2;0"
                                   DeviceSerialNumber                 : Serial number of the camera.
                                                                        flags: readable
                                                                        String. Default: "40407253"
                                   DeviceUserID                       : User-settable ID of the camera.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        String. Default: ""
                                   DeviceScanType                     : Indicates the scan type of the camera's sensor (area or line scan).
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_DeviceScanType" Default: 0, "Areascan"
                                                                           (0): Areascan           - The camera has an area scan sensor.
                                                                           (1): Linescan           - The camera has a line scan sensor.
                                   TimestampLatchValue                : Latched value of the timestamp counter.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 9223372036854775807 Default: 0
                                   DeviceLinkSpeed                    : Speed of transmission negotiated on the selected link.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 500000000
                                   DeviceLinkThroughputLimitMode      : Enables/disables the device link throughput limit.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_DeviceLinkThroughputLimitMode" Default: 1, "On"
                                                                           (0): Off                - The Device Link Throughput Limit parameter is disabled.
                                                                           (1): On                 - The Device Link Throughput Limit parameter is enabled.
                                   DeviceLinkThroughputLimit          : Bandwidth limit for data transmission (in bytes per second).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 524288 - 419430400 Default: 360000000
                                   DeviceLinkCurrentThroughput        : Actual bandwidth the camera will use.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 354198133
                                   DeviceTemperature                  : Temperature at the selected location in the camera (in degrees centigrade).
                                                                        flags: readable
                                                                        Double. Range: -2.1e+09 - 2.1e+09 Default: 54
                                   TemperatureState                   : Indicates the temperature state.
                                                                        flags: readable
                                                                        Enum "_2676_ba02_2_3_5_TemperatureState" Default: 0, "Ok"
                                                                           (0): Ok                 - The temperature is normal.
                                                                           (1): Critical           - The temperature is critical.
                                                                           (2): Error              - The temperature state could not be retrieved.
                                   DeviceSFNCVersionMajor             : Major version number of the SFNC specification that the camera is compatible with.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 2
                                   DeviceSFNCVersionMinor             : Minor version number of the SFNC specification that the camera is compatible with.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 1
                                   DeviceSFNCVersionSubMinor          : Subminor version number of the SFNC specification that the camera is compatible with.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   UserDefinedValue-Value1            : User-defined value.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: -2147483648 - 2147483647 Default: 0
                                   UserDefinedValue-Value2            : User-defined value.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: -2147483648 - 2147483647 Default: 0
                                   UserDefinedValue-Value3            : User-defined value.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: -2147483648 - 2147483647 Default: 0
                                   UserDefinedValue-Value4            : User-defined value.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: -2147483648 - 2147483647 Default: 0
                                   UserDefinedValue-Value5            : User-defined value.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: -2147483648 - 2147483647 Default: 0
                                   RemoveParameterLimit               : Removes the factory-set limit of the selected parameter.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   ExpertFeatureAccessKey-ExpertFeature1: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature2: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature3: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature4: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature5: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature6: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature7: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature8: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature9: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature10: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   ExpertFeatureAccessKey-ExpertFeature11: Key for making the selected expert feature available.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   PgiMode                            : Enables Basler PGI image optimizations.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Enum "_2676_ba02_2_3_5_PgiMode" Default: 0, "Off"
                                                                           (0): Off                - Basler PGI image optimizations are disabled.
                                                                           (1): On                 - Basler PGI image optimizations are enabled.
                                   AutoFunctionROIWidth-ROI1          : Width of the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1456 Default: 1440
                                   AutoFunctionROIWidth-ROI2          : Width of the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1456 Default: 1440
                                   AutoFunctionROIHeight-ROI1         : Height of the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1088 Default: 1080
                                   AutoFunctionROIHeight-ROI2         : Height of the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1088 Default: 1080
                                   AutoFunctionROIOffsetX-ROI1        : Horizontal offset of the auto function ROI from the left side of the sensor (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1452 Default: 8
                                   AutoFunctionROIOffsetX-ROI2        : Horizontal offset of the auto function ROI from the left side of the sensor (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1452 Default: 8
                                   AutoFunctionROIOffsetY-ROI1        : Vertical offset from the top of the sensor to the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1087 Default: 8
                                   AutoFunctionROIOffsetY-ROI2        : Vertical offset from the top of the sensor to the auto function ROI (in pixels).
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Integer64. Range: 0 - 1087 Default: 8
                                   AutoFunctionROIUseBrightness-ROI1  : Assigns the Gain Auto and the Exposure Auto auto functions to the currently selected auto function ROI.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   AutoFunctionROIUseBrightness-ROI2  : Assigns the Gain Auto and the Exposure Auto auto functions to the currently selected auto function ROI.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: false
                                   AutoFunctionROIUseWhiteBalance-ROI1: Assigns the Balance White Auto auto function to the currently selected auto function ROI.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: true
                                   AutoFunctionROIUseWhiteBalance-ROI2: Assigns the Balance White Auto auto function to the currently selected auto function ROI.
                                                                        flags: readable, writable, changeable in NULL, READY, PAUSED or PLAYING state
                                                                        Boolean. Default: true
                        flags: readable
                        Object of type "GObject"
  capture-error       : The strategy to use in case of a camera capture error.
                        flags: readable, writable, controllable
                        Enum "GstPylonCaptureErrorEnum" Default: 2, "Stop pipeline in case of any capture error"
                           (0): Use partial or corrupt buffers - keep
                           (1): Skip partial or corrupt buffers. A maximum of 100 buffers can be skipped before the pipeline aborts. - skip
                           (2): Stop pipeline in case of any capture error - abort
  device-index        : The index of the device to use.This index applies to the resulting device list after applying the other device selection properties. The index is mandatory if multiple devices match the given search criteria.
                        flags: readable, writable, changeable only in NULL or READY state
                        Integer. Range: -1 - 2147483647 Default: -1
  device-serial-number: The serial number of the device to use. May be combined with other device selection properties to reduce the search.
                        flags: readable, writable, changeable only in NULL or READY state
                        String. Default: null
  device-user-name    : The user-defined name of the device to use. May be combinedwith other device selection properties to reduce the search.
                        flags: readable, writable, changeable only in NULL or READY state
                        String. Default: null
  do-timestamp        : Apply current stream time to buffers
                        flags: readable, writable
                        Boolean. Default: false
  enable-correction   : If enabled, the values from other parameters will be automatically corrected.  If any of the properties holds an incorrect value given an specific configuration it will be corrected
                        flags: readable, writable, changeable only in NULL or READY state
                        Boolean. Default: true
  name                : The name of the object
                        flags: readable, writable
                        String. Default: "pylonsrc0"
  num-buffers         : Number of buffers to output before sending EOS (-1 = unlimited)
                        flags: readable, writable
                        Integer. Range: -1 - 2147483647 Default: -1
  parent              : The parent of the object
                        flags: readable, writable
                        Object of type "GstObject"
  pfs-location        : The filepath to the PFS file from which to load the device configuration. Setting this property will override the user set property if also set.
                        flags: readable, writable, changeable only in NULL or READY state
                        String. Default: null
  stream              : The stream grabber to use.
			According to the selected stream grabber different properties will be available.
 			These properties can be accessed using the "stream::<property>" syntax.
			The following list details the properties for each stream grabber.
    Basler acA1440-220um (40407253) Stream Grabber:

                                   name                               : The name of the object
                                                                        flags: readable, writable
                                                                        String. Default: "(null)"
                                   parent                             : The parent of the object
                                                                        flags: readable, writable
                                                                        (null)
                                   MaxNumBuffer                       : Maximum number of buffers that can be used simultaneously for grabbing images.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 2147483647 Default: 16
                                   MaxBufferSize                      : Maximum size (in bytes) of a buffer used for grabbing images.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 9223372036854775807 Default: 131072
                                   MaxTransferSize                    : Maximum USB data transfer size in bytes.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1024 - 4194304 Default: 262144
                                   NumMaxQueuedUrbs                   : Maximum number of USB request blocks (URBs) to be enqueued simultaneously.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 1 - 4294967295 Default: 64
                                   TransferLoopThreadPriority         : Priority of the thread that handles USB requests from the stream interface.
                                                                        flags: readable, writable, changeable only in NULL or READY state
                                                                        Integer64. Range: 0 - 0 Default: 0
                                   Statistic-Total-Buffer-Count       : GigE cameras: Number of frames received. Other cameras: Number of buffers processed.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   Statistic-Failed-Buffer-Count      : GigE cameras: Number of buffers with at least one failed packet. A packet is considered failed if its status is not 'success'. Other cameras: Number of buffers that returned with an error status.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   Statistic-Last-Failed-Buffer-Status: Status code of the last failed buffer.
                                                                        flags: readable
                                                                        Integer64. Range: 0 - 4294967295 Default: 0
                                   Statistic-Last-Failed-Buffer-Status-Text: Status code of the last failed buffer.
                                                                        flags: readable
                                                                        String. Default: ""
                                   Statistic-Missed-Frame-Count       : Number of corrupt or lost frames between successfully grabbed images.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   Statistic-Resynchronization-Count  : Number of stream resynchronizations.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   Statistic-Last-Block-Id            : Last grabbed block ID.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                                   Statistic-Out-Of-Memory-Error-Count: Number of out-of-memory errors.
                                                                        flags: readable
                                                                        Integer64. Range: -9223372036854775808 - 9223372036854775807 Default: 0
                        flags: readable
                        Object of type "GObject"
  typefind            : Run typefind before negotiating (deprecated, non-functional)
                        flags: readable, writable, deprecated
                        Boolean. Default: false
  user-set            : The user-defined configuration set to use. Leaving this property unset, or using 'Auto' result in selecting the power-on default camera configuration.
                        flags: readable, writable, changeable only in NULL or READY state
                        String. Default: null


`;

            const gstInspectOutput = `

pbtypes:  GstVideoMultiviewFlagsSet (GstDynamicTypeFactory)
flxdec:  flxdec: FLX video decoder
audioresample:  audioresample: Audio resampler
asfmux:  asfmux: ASF muxer
asfmux:  rtpasfpay: RTP ASF payloader
asfmux:  asfparse: ASF parser
waylandsink:  waylandsink: wayland video sink
effectv:  edgetv: EdgeTV effect
effectv:  agingtv: AgingTV effect
effectv:  dicetv: DiceTV effect
effectv:  warptv: WarpTV effect
effectv:  shagadelictv: ShagadelicTV
effectv:  vertigotv: VertigoTV effect
effectv:  revtv: RevTV effect
effectv:  quarktv: QuarkTV effect
effectv:  optv: OpTV effect
effectv:  radioactv: RadioacTV effect
effectv:  streaktv: StreakTV effect
effectv:  rippletv: RippleTV effect
nvtee:  nvtee: NvTee
ximagesink:  ximagesink: Video sink
autoconvert:  autoconvert: Select convertor based on caps
autoconvert:  autovideoconvert: Select color space convertor based on caps
mpegtsdemux:  tsparse: MPEG transport stream parser
mpegtsdemux:  tsdemux: MPEG transport stream demuxer
smooth:  smooth: Smooth effect
rtpmanager:  rtpbin: RTP Bin
rtpmanager:  rtpjitterbuffer: RTP packet jitter-buffer
rtpmanager:  rtpptdemux: RTP Demux
rtpmanager:  rtpsession: RTP Session
rtpmanager:  rtprtxqueue: RTP Retransmission Queue
rtpmanager:  rtprtxreceive: RTP Retransmission receiver
rtpmanager:  rtprtxsend: RTP Retransmission Sender
rtpmanager:  rtpssrcdemux: RTP SSRC Demux
rtpmanager:  rtpmux: RTP muxer
rtpmanager:  rtpdtmfmux: RTP muxer
rtpmanager:  rtpfunnel: RTP funnel
aom:  av1enc: AV1 Encoder
aom:  av1dec: AV1 Decoder
xingmux:  xingmux: MP3 Xing muxer
ttmlsubs:  ttmlparse: TTML subtitle parser
ttmlsubs:  ttmlrender: TTML subtitle renderer
encoding:  encodebin: Encoder Bin
gdp:  gdpdepay: GDP Depayloader
gdp:  gdppay: GDP Payloader
wavenc:  wavenc: WAV audio muxer
webrtcdsp:  webrtcdsp: Voice Processor (AGC, AEC, filters, etc.)
webrtcdsp:  webrtcechoprobe: Accoustic Echo Canceller probe
sctp:  sctpenc: SCTP Encoder
sctp:  sctpdec: SCTP Decoder
audiotestsrc:  audiotestsrc: Audio test source
nvvideosink:  nvvideosink: nVidia Video Sink
videobox:  videobox: Video box filter
gtk:  gtksink: Gtk Video Sink
gtk:  gtkglsink: Gtk GL Video Sink
oss4:  oss4sink: OSS v4 Audio Sink
oss4:  oss4src: OSS v4 Audio Source
multipart:  multipartdemux: Multipart demuxer
multipart:  multipartmux: Multipart muxer
mpegpsdemux:  mpegpsdemux: MPEG Program Stream Demuxer
dvdread:  dvdreadsrc: DVD Source
auparse:  auparse: AU audio demuxer
openexr:  openexrdec: OpenEXR decoder
openal:  openalsink: OpenAL Audio Sink
openal:  openalsrc: OpenAL Audio Source
xvimagesink:  xvimagesink: Video sink
id3demux:  id3demux: ID3 tag demuxer
mulaw:  mulawenc: Mu Law audio encoder
mulaw:  mulawdec: Mu Law audio decoder
speex:  speexenc: Speex audio encoder
speex:  speexdec: Speex audio decoder
adpcmenc:  adpcmenc: ADPCM encoder
y4mdec:  y4mdec: YUV4MPEG demuxer/decoder
voaacenc:  voaacenc: AAC audio encoder
cacasink:  cacasink: A colored ASCII art video sink
ogg:  oggdemux: Ogg demuxer
ogg:  oggmux: Ogg muxer
ogg:  ogmaudioparse: OGM audio stream parser
ogg:  ogmvideoparse: OGM video stream parser
ogg:  ogmtextparse: OGM text stream parser
ogg:  oggparse: Ogg parser
ogg:  oggaviparse: Ogg AVI parser
bz2:  bz2enc: BZ2 encoder
bz2:  bz2dec: BZ2 decoder
ofa:  ofa: OFA
rawparse:  unalignedaudioparse: unalignedaudioparse
rawparse:  unalignedvideoparse: unalignedvideoparse
rawparse:  rawaudioparse: rawaudioparse
rawparse:  rawvideoparse: rawvideoparse
goom2k1:  goom2k1: GOOM: what a GOOM! 2k1 edition
alaw:  alawenc: A Law audio encoder
alaw:  alawdec: A Law audio decoder
videoconvert:  videoconvert: Colorspace converter
netsim:  netsim: Network Simulator
siren:  sirendec: Siren Decoder element
siren:  sirenenc: Siren Encoder element
sndfile:  sfdec: Sndfile decoder
rtp:  rtpac3depay: RTP AC3 depayloader
rtp:  rtpac3pay: RTP AC3 audio payloader
rtp:  rtpbvdepay: RTP BroadcomVoice depayloader
rtp:  rtpbvpay: RTP BV Payloader
rtp:  rtpceltdepay: RTP CELT depayloader
rtp:  rtpceltpay: RTP CELT payloader
rtp:  rtpdvdepay: RTP DV Depayloader
rtp:  rtpdvpay: RTP DV Payloader
rtp:  rtpgstdepay: GStreamer depayloader
rtp:  rtpgstpay: RTP GStreamer payloader
rtp:  rtpilbcpay: RTP iLBC Payloader
rtp:  rtpilbcdepay: RTP iLBC depayloader
rtp:  rtpg722depay: RTP audio depayloader
rtp:  rtpg722pay: RTP audio payloader
rtp:  rtpg723depay: RTP G.723 depayloader
rtp:  rtpg723pay: RTP G.723 payloader
rtp:  rtpg726depay: RTP G.726 depayloader
rtp:  rtpg726pay: RTP G.726 payloader
rtp:  rtpg729depay: RTP G.729 depayloader
rtp:  rtpg729pay: RTP G.729 payloader
rtp:  rtpgsmdepay: RTP GSM depayloader
rtp:  rtpgsmpay: RTP GSM payloader
rtp:  rtpamrdepay: RTP AMR depayloader
rtp:  rtpamrpay: RTP AMR payloader
rtp:  rtppcmadepay: RTP PCMA depayloader
rtp:  rtppcmudepay: RTP PCMU depayloader
rtp:  rtppcmupay: RTP PCMU payloader
rtp:  rtppcmapay: RTP PCMA payloader
rtp:  rtpmpadepay: RTP MPEG audio depayloader
rtp:  rtpmpapay: RTP MPEG audio payloader
rtp:  rtpmparobustdepay: RTP MPEG audio depayloader
rtp:  rtpmpvdepay: RTP MPEG video depayloader
rtp:  rtpmpvpay: RTP MPEG2 ES video payloader
rtp:  rtpopusdepay: RTP Opus packet depayloader
rtp:  rtpopuspay: RTP Opus payloader
rtp:  rtph261pay: RTP H261 packet payloader
rtp:  rtph261depay: RTP H261 depayloader
rtp:  rtph263ppay: RTP H263 payloader
rtp:  rtph263pdepay: RTP H263 depayloader
rtp:  rtph263depay: RTP H263 depayloader
rtp:  rtph263pay: RTP H263 packet payloader
rtp:  rtph264depay: RTP H264 depayloader
rtp:  rtph264pay: RTP H264 payloader
rtp:  rtph265depay: RTP H265 depayloader
rtp:  rtph265pay: RTP H265 payloader
rtp:  rtpj2kdepay: RTP JPEG 2000 depayloader
rtp:  rtpj2kpay: RTP JPEG 2000 payloader
rtp:  rtpjpegdepay: RTP JPEG depayloader
rtp:  rtpjpegpay: RTP JPEG payloader
rtp:  rtpklvdepay: RTP KLV Depayloader
rtp:  rtpklvpay: RTP KLV Payloader
rtp:  rtpL8pay: RTP audio payloader
rtp:  rtpL8depay: RTP audio depayloader
rtp:  rtpL16pay: RTP audio payloader
rtp:  rtpL16depay: RTP audio depayloader
rtp:  rtpL24pay: RTP audio payloader
rtp:  rtpL24depay: RTP audio depayloader
rtp:  asteriskh263: RTP Asterisk H263 depayloader
rtp:  rtpmp1sdepay: RTP MPEG1 System Stream depayloader
rtp:  rtpmp2tdepay: RTP MPEG Transport Stream depayloader
rtp:  rtpmp2tpay: RTP MPEG2 Transport Stream payloader
rtp:  rtpmp4vpay: RTP MPEG4 Video payloader
rtp:  rtpmp4vdepay: RTP MPEG4 video depayloader
rtp:  rtpmp4apay: RTP MPEG4 audio payloader
rtp:  rtpmp4adepay: RTP MPEG4 audio depayloader
rtp:  rtpmp4gdepay: RTP MPEG4 ES depayloader
rtp:  rtpmp4gpay: RTP MPEG4 ES payloader
rtp:  rtpqcelpdepay: RTP QCELP depayloader
rtp:  rtpqdm2depay: RTP QDM2 depayloader
rtp:  rtpsbcdepay: RTP SBC audio depayloader
rtp:  rtpsbcpay: RTP packet payloader
rtp:  rtpsirenpay: RTP Payloader for Siren Audio
rtp:  rtpsirendepay: RTP Siren packet depayloader
rtp:  rtpspeexpay: RTP Speex payloader
rtp:  rtpspeexdepay: RTP Speex depayloader
rtp:  rtpsv3vdepay: RTP SVQ3 depayloader
rtp:  rtptheoradepay: RTP Theora depayloader
rtp:  rtptheorapay: RTP Theora payloader
rtp:  rtpvorbisdepay: RTP Vorbis depayloader
rtp:  rtpvorbispay: RTP Vorbis payloader
rtp:  rtpvp8depay: RTP VP8 depayloader
rtp:  rtpvp8pay: RTP VP8 payloader
rtp:  rtpvp9depay: RTP VP9 depayloader
rtp:  rtpvp9pay: RTP VP9 payloader
rtp:  rtpvrawdepay: RTP Raw Video depayloader
rtp:  rtpvrawpay: RTP Raw Video payloader
rtp:  rtpstreampay: RTP Stream Payloading
rtp:  rtpstreamdepay: RTP Stream Depayloading
rtp:  rtpredenc: Redundant Audio Data (RED) Encoder
rtp:  rtpreddec: Redundant Audio Data (RED) Decoder
rtp:  rtpulpfecdec: RTP FEC Decoder
rtp:  rtpulpfecenc: RTP FEC Encoder
rtp:  rtpstorage: RTP storage
mxf:  mxfdemux: MXF Demuxer
mxf:  mxfmux: MXF muxer
a52dec:  a52dec: ATSC A/52 audio decoder
sid:  siddec: Sid decoder
flv:  flvdemux: FLV Demuxer
flv:  flvmux: FLV muxer
amrnb:  amrnbdec: AMR-NB audio decoder
amrnb:  amrnbenc: AMR-NB audio encoder
assrender:  assrender: ASS/SSA Render
dtsdec:  dtsdec: DTS audio decoder
nvivafilter:  nvivafilter: NvIVAFilter Plugin
openmpt:  openmptdec: OpenMPT-based module music decoder
ximagesrc:  ximagesrc: Ximage video source
videoframe_audiolevel:  videoframe-audiolevel: Video-frame audio level
webrtc:  webrtcbin: WebRTC Bin
videorate:  videorate: Video rate adjuster
dvbsuboverlay:  dvbsuboverlay: DVB Subtitles Overlay
audiofxbad:  audiochannelmix: Simple stereo audio mixer
hls:  hlsdemux: HLS Demuxer
hls:  hlssink: HTTP Live Streaming sink
hls:  hlssink2: HTTP Live Streaming sink
typefindfunctions: video/x-ms-asf: asf, wm, wma, wmv
typefindfunctions: audio/x-musepack: mpc, mpp, mp+
typefindfunctions: audio/x-au: au, snd
typefindfunctions: video/x-msvideo: avi
typefindfunctions: audio/qcelp: qcp
typefindfunctions: video/x-cdxa: dat
typefindfunctions: video/x-vcd: dat
typefindfunctions: audio/x-imelody: imy, ime, imelody
typefindfunctions: application/x-scc: scc
typefindfunctions: application/x-mcc: mcc
typefindfunctions: audio/midi: mid, midi
typefindfunctions: audio/riff-midi: mid, midi
typefindfunctions: audio/mobile-xmf: mxmf
typefindfunctions: video/x-fli: flc, fli
typefindfunctions: application/x-id3v2: mp3, mp2, mp1, mpga, ogg, flac, tta
typefindfunctions: application/x-id3v1: mp3, mp2, mp1, mpga, ogg, flac, tta
typefindfunctions: application/x-apetag: mp3, ape, mpc, wv
typefindfunctions: audio/x-ttafile: tta
typefindfunctions: audio/x-mod: 669, amf, ams, dbm, digi, dmf, dsm, gdm, far, imf, it, j2b, mdl, med, mod, mt2, mtm, okt, psm, ptm, sam, s3m, stm, stx, ult, umx, xm
typefindfunctions: audio/mpeg: mp3, mp2, mp1, mpga
typefindfunctions: audio/x-ac3: ac3, eac3
typefindfunctions: audio/x-dts: dts
typefindfunctions: audio/x-gsm: gsm
typefindfunctions: video/mpeg-sys: mpe, mpeg, mpg
typefindfunctions: video/mpegts: ts, mts
typefindfunctions: application/ogg: ogg, oga, ogv, ogm, ogx, spx, anx, axa, axv
typefindfunctions: video/mpeg-elementary: mpv, mpeg, mpg
typefindfunctions: video/mpeg4: m4v
typefindfunctions: video/x-h263: h263, 263
typefindfunctions: video/x-h264: h264, x264, 264
typefindfunctions: video/x-h265: h265, x265, 265
typefindfunctions: video/x-nuv: nuv
typefindfunctions: audio/x-m4a: m4a
typefindfunctions: application/x-3gp: 3gp
typefindfunctions: video/quicktime: mov, mp4
typefindfunctions: image/x-quicktime: qif, qtif, qti
typefindfunctions: image/jp2: jp2
typefindfunctions: image/x-jpc: jpc, j2k
typefindfunctions: video/mj2: mj2
typefindfunctions: text/html: htm, html
typefindfunctions: application/vnd.rn-realmedia: ra, ram, rm, rmvb
typefindfunctions: application/x-pn-realaudio: ra, ram, rm, rmvb
typefindfunctions: application/x-shockwave-flash: swf, swfl
typefindfunctions: application/xges: xges
typefindfunctions: application/dash+xml: mpd, MPD
typefindfunctions: application/vnd.ms-sstr+xml: no extensions
typefindfunctions: video/x-flv: flv
typefindfunctions: text/plain: txt
typefindfunctions: text/utf-16: txt
typefindfunctions: text/utf-32: txt
typefindfunctions: text/uri-list: ram
typefindfunctions: application/itc: itc
typefindfunctions: application/x-hls: m3u8
typefindfunctions: application/sdp: sdp
typefindfunctions: application/smil: smil
typefindfunctions: application/ttml+xml: ttml+xml
typefindfunctions: application/xml: xml
typefindfunctions: audio/x-wav: wav
typefindfunctions: audio/x-aiff: aiff, aif, aifc
typefindfunctions: audio/x-svx: iff, svx
typefindfunctions: audio/x-paris: paf
typefindfunctions: audio/x-nist: nist
typefindfunctions: audio/x-voc: voc
typefindfunctions: audio/x-sds: sds
typefindfunctions: audio/x-ircam: sf
typefindfunctions: audio/x-w64: w64
typefindfunctions: audio/x-rf64: rf64
typefindfunctions: audio/x-shorten: shn
typefindfunctions: application/x-ape: ape
typefindfunctions: image/jpeg: jpg, jpe, jpeg
typefindfunctions: image/gif: gif
typefindfunctions: image/png: png
typefindfunctions: image/bmp: bmp
typefindfunctions: image/tiff: tif, tiff
typefindfunctions: image/webp: webp
typefindfunctions: image/x-exr: exr
typefindfunctions: image/x-portable-pixmap: pnm, ppm, pgm, pbm
typefindfunctions: video/x-matroska: mkv, mka, mk3d, webm
typefindfunctions: application/mxf: mxf
typefindfunctions: video/x-mve: mve
typefindfunctions: video/x-dv: dv, dif
typefindfunctions: audio/x-amr-nb-sh: amr
typefindfunctions: audio/x-amr-wb-sh: amr
typefindfunctions: audio/iLBC-sh: ilbc
typefindfunctions: audio/x-sbc: sbc
typefindfunctions: audio/x-sid: sid
typefindfunctions: image/x-xcf: xcf
typefindfunctions: video/x-mng: mng
typefindfunctions: image/x-jng: jng
typefindfunctions: image/x-xpixmap: xpm
typefindfunctions: image/x-sun-raster: ras
typefindfunctions: application/x-bzip: bz2
typefindfunctions: application/x-gzip: gz
typefindfunctions: application/zip: zip
typefindfunctions: application/x-compress: Z
typefindfunctions: subtitle/x-kate: no extensions
typefindfunctions: application/x-subtitle-vtt: vtt
typefindfunctions: audio/x-flac: flac
typefindfunctions: audio/x-vorbis: no extensions
typefindfunctions: video/x-theora: no extensions
typefindfunctions: application/x-ogm-video: no extensions
typefindfunctions: application/x-ogm-audio: no extensions
typefindfunctions: application/x-ogm-text: no extensions
typefindfunctions: audio/x-speex: no extensions
typefindfunctions: audio/x-celt: no extensions
typefindfunctions: application/x-ogg-skeleton: no extensions
typefindfunctions: text/x-cmml: no extensions
typefindfunctions: application/x-executable: no extensions
typefindfunctions: audio/aac: aac, adts, adif, loas
typefindfunctions: audio/x-spc: spc
typefindfunctions: audio/x-wavpack: wv, wvp
typefindfunctions: audio/x-wavpack-correction: wvc
typefindfunctions: audio/x-caf: caf
typefindfunctions: application/postscript: ps
typefindfunctions: image/svg+xml: svg
typefindfunctions: application/x-rar: rar
typefindfunctions: application/x-tar: tar
typefindfunctions: application/x-ar: a
typefindfunctions: application/x-ms-dos-executable: dll, exe, ocx, sys, scr, msstyles, cpl
typefindfunctions: video/x-dirac: no extensions
typefindfunctions: multipart/x-mixed-replace: no extensions
typefindfunctions: application/x-mmsh: no extensions
typefindfunctions: video/vivo: viv
typefindfunctions: audio/x-nsf: nsf
typefindfunctions: audio/x-gym: gym
typefindfunctions: audio/x-ay: ay
typefindfunctions: audio/x-gbs: gbs
typefindfunctions: audio/x-vgm: vgm
typefindfunctions: audio/x-sap: sap
typefindfunctions: video/x-ivf: ivf
typefindfunctions: audio/x-kss: kss
typefindfunctions: application/pdf: pdf
typefindfunctions: application/msword: doc
typefindfunctions: image/vnd.adobe.photoshop: psd
typefindfunctions: image/vnd.wap.wbmp: no extensions
typefindfunctions: application/x-yuv4mpeg: no extensions
typefindfunctions: image/x-icon: no extensions
typefindfunctions: image/x-degas: no extensions
typefindfunctions: application/octet-stream: no extensions
typefindfunctions: application/x-ssa: ssa, ass
typefindfunctions: video/x-pva: pva
typefindfunctions: audio/x-xi: xi
typefindfunctions: audio/audible: aa, aax
typefindfunctions: audio/x-tap-tap: tap
typefindfunctions: audio/x-tap-dmp: dmp
dv:  dvdemux: DV system stream demuxer
dv:  dvdec: DV video decoder
webp:  webpdec: WebP image decoder
webp:  webpenc: WEBP image encoder
nvdrmvideosink:  nvdrmvideosink: Nvidia Drm Video Sink
compositor:  compositor: Compositor
tcp:  socketsrc: socket source
tcp:  tcpclientsink: TCP client sink
tcp:  tcpclientsrc: TCP client source
tcp:  tcpserversink: TCP server sink
tcp:  tcpserversrc: TCP server source
tcp:  multifdsink: Multi filedescriptor sink
tcp:  multisocketsink: Multi socket sink
musepack:  musepackdec: Musepack decoder
dc1394:  dc1394src: 1394 IIDC Video Source
flite:  flitetestsrc: Flite speech test source
1394:  dv1394src: Firewire (1394) DV video source
1394:  hdv1394src: Firewire (1394) HDV video source
mplex:  mplex: mplex video multiplexer
amrwbdec:  amrwbdec: AMR-WB audio decoder
opus:  opusenc: Opus audio encoder
opus:  opusdec: Opus audio decoder
lame:  lamemp3enc: L.A.M.E. mp3 encoder
alsa:  alsasrc: Audio source (ALSA)
alsa:  alsasink: Audio sink (ALSA)
alsa:  alsamidisrc: AlsaMidi Source
subenc:  srtenc: Srt encoder
subenc:  webvttenc: WebVTT encoder
adder:  adder: Adder
autodetect:  autovideosink: Auto video sink
autodetect:  autovideosrc: Auto video source
autodetect:  autoaudiosink: Auto audio sink
autodetect:  autoaudiosrc: Auto audio source
dvdlpcmdec:  dvdlpcmdec: DVD LPCM Audio decoder
udp:  udpsink: UDP packet sender
udp:  multiudpsink: UDP packet sender
udp:  dynudpsink: UDP packet sender
udp:  udpsrc: UDP packet receiver
png:  pngdec: PNG image decoder
png:  pngenc: PNG image encoder
yadif:  yadif: YADIF deinterlacer
vmnc:  vmncdec: VMnc video decoder
dvdspu:  dvdspu: Sub-picture Overlay
bs2b:  bs2b: Crossfeed effect
nvjpeg:  nvjpegenc: JPEG image encoder
nvjpeg:  nvjpegdec: JPEG image decoder
vulkan:  vulkansink: Vulkan video sink
vulkan:  vulkanupload: Vulkan Uploader
spectrum:  spectrum: Spectrum analyzer
fieldanalysis:  fieldanalysis: Video field analysis
rtmp:  rtmpsrc: RTMP Source
rtmp:  rtmpsink: RTMP output sink
srtp:  srtpenc: SRTP encoder
srtp:  srtpdec: SRTP decoder
deinterlace:  deinterlace: Deinterlacer
coretracers:  latency (GstTracerFactory)
coretracers:  log (GstTracerFactory)
coretracers:  rusage (GstTracerFactory)
coretracers:  stats (GstTracerFactory)
coretracers:  leaks (GstTracerFactory)
wavpack:  wavpackdec: Wavpack audio decoder
wavpack:  wavpackenc: Wavpack audio encoder
subparse: subparse_typefind: srt, sub, mpsub, mdvd, smi, txt, dks, vtt
subparse:  subparse: Subtitle parser
subparse:  ssaparse: SSA Subtitle Parser
audiovisualizers:  spacescope: Stereo visualizer
audiovisualizers:  spectrascope: Frequency spectrum scope
audiovisualizers:  synaescope: Synaescope
audiovisualizers:  wavescope: Waveform oscilloscope
cdparanoia:  cdparanoiasrc: CD Audio (cdda) Source, Paranoia IV
monoscope:  monoscope: Monoscope
fbdevsink:  fbdevsink: fbdev video sink
nvvidconv:  nvvidconv: NvVidConv Plugin
midi:  midiparse: MidiParse
shapewipe:  shapewipe: Shape Wipe transition filter
wildmidi:  wildmididec: WildMidi-based MIDI music decoder
theora:  theoradec: Theora video decoder
theora:  theoraenc: Theora video encoder
theora:  theoraparse: Theora video parser
ossaudio:  osssrc: Audio Source (OSS)
ossaudio:  osssink: Audio Sink (OSS)
resindvd:  rsndvdbin: rsndvdbin
pylon:  pylonsrc: Basler/Pylon source element
gaudieffects:  burn: Burn
gaudieffects:  chromium: Chromium
gaudieffects:  dilate: Dilate
gaudieffects:  dodge: Dodge
gaudieffects:  exclusion: Exclusion
gaudieffects:  solarize: Solarize
gaudieffects:  gaussianblur: GstGaussianBlur
audiofx:  audiopanorama: Stereo positioning
audiofx:  audioinvert: Audio inversion
audiofx:  audiokaraoke: AudioKaraoke
audiofx:  audioamplify: Audio amplifier
audiofx:  audiodynamic: Dynamic range controller
audiofx:  audiocheblimit: Low pass & high pass filter
audiofx:  audiochebband: Band pass & band reject filter
audiofx:  audioiirfilter: Audio IIR filter
audiofx:  audiowsinclimit: Low pass & high pass filter
audiofx:  audiowsincband: Band pass & band reject filter
audiofx:  audiofirfilter: Audio FIR filter
audiofx:  audioecho: Audio echo
audiofx:  scaletempo: Scaletempo
audiofx:  stereo: Stereo effect
audiomixer:  audiomixer: AudioMixer
audiomixer:  liveadder: AudioMixer
audiomixer:  audiointerleave: AudioInterleave
navigationtest:  navigationtest: Video navigation test
dashdemux:  dashdemux: DASH Demuxer
audioparsers:  aacparse: AAC audio stream parser
audioparsers:  amrparse: AMR audio stream parser
audioparsers:  ac3parse: AC3 audio stream parser
audioparsers:  dcaparse: DTS Coherent Acoustics audio stream parser
audioparsers:  flacparse: FLAC audio parser
audioparsers:  mpegaudioparse: MPEG1 Audio Parser
audioparsers:  sbcparse: SBC audio parser
audioparsers:  wavpackparse: Wavpack audio stream parser
teletext:  teletextdec: Teletext decoder
mpg123:  mpg123audiodec: mpg123 mp3 decoder
nvv4l2camerasrc:  nvv4l2camerasrc: NvV4l2CameraSrc
cutter:  cutter: Audio cutter
faceoverlay:  faceoverlay: faceoverlay
kate:  katedec: Kate stream text decoder
kate:  kateenc: Kate stream encoder
kate:  kateparse: Kate stream parser
kate:  katetag: Kate stream tagger
jack:  jackaudiosrc: Audio Source (Jack)
jack:  jackaudiosink: Audio Sink (Jack)
audioconvert:  audioconvert: Audio converter
camerabin:  viewfinderbin: Viewfinder Bin
camerabin:  wrappercamerabinsrc: Wrapper camera src element for camerabin2
camerabin:  camerabin: Camera Bin
bayer:  bayer2rgb: Bayer to RGB decoder for cameras
bayer:  rgb2bayer: RGB to Bayer converter
gsm:  gsmenc: GSM audio encoder
gsm:  gsmdec: GSM audio decoder
audiorate:  audiorate: Audio rate adjuster
soundtouch:  pitch: Pitch controller
soundtouch:  bpmdetect: BPM Detector
mpegtsmux:  mpegtsmux: MPEG Transport Stream Muxer
audiolatency:  audiolatency: AudioLatency
videoscale:  videoscale: Video scaler
timecode:  timecodestamper: Timecode stamper
timecode:  avwait: Timecode Wait
cairo:  cairooverlay: Cairo overlay
nvegltransform:  nvegltransform: NvEGLTransform
de265:  libde265dec: HEVC/H.265 decoder
interlace:  interlace: Interlace filter
equalizer:  equalizer-nbands: N Band Equalizer
equalizer:  equalizer-3bands: 3 Band Equalizer
equalizer:  equalizer-10bands: 10 Band Equalizer
overlaycomposition:  overlaycomposition: Overlay Composition
pcapparse:  pcapparse: PCapParse
pcapparse:  irtspparse: IRTSPParse
audiobuffersplit:  audiobuffersplit: Audio Buffer Split
colormanagement:  lcms: LCMS2 ICC correction
nvvideosinks:  nv3dsink: Nvidia 3D sink
geometrictransform:  circle: circle
geometrictransform:  diffuse: diffuse
geometrictransform:  kaleidoscope: kaleidoscope
geometrictransform:  marble: marble
geometrictransform:  pinch: pinch
geometrictransform:  rotate: rotate
geometrictransform:  sphere: sphere
geometrictransform:  twirl: twirl
geometrictransform:  waterripple: waterripple
geometrictransform:  stretch: stretch
geometrictransform:  bulge: bulge
geometrictransform:  tunnel: tunnel
geometrictransform:  square: square
geometrictransform:  mirror: mirror
geometrictransform:  fisheye: fisheye
geometrictransform:  perspective: perspective
videotestsrc:  videotestsrc: Video test source
nveglstreamsrc:  nveglstreamsrc: nVidia EGL Stream
pnm:  pnmdec: PNM image decoder
pnm:  pnmenc: PNM image encoder
mpegpsmux:  mpegpsmux: MPEG Program Stream Muxer
ipcpipeline:  ipcpipelinesrc: Inter-process Pipeline Source
ipcpipeline:  ipcpipelinesink: Inter-process Pipeline Sink
ipcpipeline:  ipcslavepipeline: Inter-process slave pipeline
zbar:  zbar: Barcode detector
smpte:  smpte: SMPTE transitions
smpte:  smptealpha: SMPTE transitions
debug:  breakmydata: Break my data
debug:  capssetter: CapsSetter
debug:  rndbuffersize: Random buffer size
debug:  navseek: Seek based on left-right arrows
debug:  pushfilesrc: Push File Source
debug:  progressreport: Progress report
debug:  taginject: TagInject
debug:  testsink: Test plugin
debug:  cpureport: CPU report
imagefreeze:  imagefreeze: Still frame stream generator
replaygain:  rganalysis: ReplayGain analysis
replaygain:  rglimiter: ReplayGain limiter
replaygain:  rgvolume: ReplayGain volume
apetag:  apedemux: APE tag demuxer
speed:  speed: Speed
multifile:  multifilesrc: Multi-File Source
multifile:  multifilesink: Multi-File Sink
multifile:  splitfilesrc: Split-File Source
multifile:  splitmuxsink: Split Muxing Bin
multifile:  splitmuxsrc: Split File Demuxing Bin
dvdsub:  dvdsubdec: DVD subtitle decoder
dvdsub:  dvdsubparse: DVD subtitle parser
goom:  goom: GOOM: what a GOOM!
avi:  avidemux: Avi demuxer
avi:  avimux: Avi muxer
avi:  avisubtitle: Avi subtitle parser
alpha:  alpha: Alpha filter
jpegformat:  jpegparse: JPEG stream parser
jpegformat:  jifmux: JPEG stream muxer
closedcaption:  cccombiner: Closed Caption Combiner
closedcaption:  ccconverter: Closed Caption Converter
closedcaption:  ccextractor: Closed Caption Extractor
closedcaption:  line21decoder: Line 21 CC Decoder
closedcaption:  cc708overlay: Closed Caption overlay
closedcaption:  line21encoder: Line 21 CC Encoder
opengl:  glimagesink: GL Sink Bin
opengl:  glimagesinkelement: OpenGL video sink
opengl:  glupload: OpenGL uploader
opengl:  gldownload: OpenGL downloader
opengl:  glcolorconvert: OpenGL color converter
opengl:  glcolorbalance: Video balance
opengl:  glfilterbin: GL Filter Bin
opengl:  glsinkbin: GL Sink Bin
opengl:  glsrcbin: GL Src Bin
opengl:  glmixerbin: OpenGL video_mixer empty bin
opengl:  glfiltercube: OpenGL cube filter
opengl:  gltransformation: OpenGL transformation filter
opengl:  glvideoflip: OpenGL video flip filter
opengl:  gleffects: Gstreamer OpenGL Effects
opengl:  gleffects_identity: Do nothing Effect
opengl:  gleffects_mirror: Mirror Effect
opengl:  gleffects_squeeze: Squeeze Effect
opengl:  gleffects_stretch: Stretch Effect
opengl:  gleffects_tunnel: Light Tunnel Effect
opengl:  gleffects_fisheye: FishEye Effect
opengl:  gleffects_twirl: Twirl Effect
opengl:  gleffects_bulge: Bulge Effect
opengl:  gleffects_square: Square Effect
opengl:  gleffects_heat: Heat Signature Effect
opengl:  gleffects_sepia: Sepia Toning Effect
opengl:  gleffects_xpro: Cross Processing Effect
opengl:  gleffects_lumaxpro: Luma Cross Processing Effect
opengl:  gleffects_xray: Glowing negative effect
opengl:  gleffects_sin: All Grey but Red Effect
opengl:  gleffects_glow: Glow Lighting Effect
opengl:  gleffects_sobel: Sobel edge detection Effect
opengl:  gleffects_blur: Blur with 9x9 separable convolution Effect
opengl:  gleffects_laplacian: Laplacian Convolution Demo Effect
opengl:  glcolorscale: OpenGL color scale
opengl:  glvideomixer: OpenGL video_mixer bin
opengl:  glvideomixerelement: OpenGL video_mixer
opengl:  glshader: OpenGL fragment shader filter
opengl:  glfilterapp: OpenGL application filter
opengl:  glviewconvert: OpenGL Multiview/3D conversion filter
opengl:  glstereosplit: GLStereoSplit
opengl:  glstereomix: OpenGL stereo video combiner
opengl:  gltestsrc: Video test source
opengl:  gldeinterlace: OpenGL deinterlacing filter
opengl:  glalpha: OpenGL Alpha Filter
opengl:  gloverlaycompositor: OpenGL overlaying filter
opengl:  gloverlay: Gstreamer OpenGL Overlay
opengl:  glfilterglass: OpenGL glass filter
opengl:  glmosaic: OpenGL mosaic
opengl:  gldifferencematte: Gstreamer OpenGL DifferenceMatte
mms:  mmssrc: MMS streaming source
dtmf:  dtmfsrc: DTMF tone generator
dtmf:  rtpdtmfsrc: RTP DTMF packet generator
dtmf:  rtpdtmfdepay: RTP DTMF packet depayloader
jp2kdecimator:  jp2kdecimator: JPEG2000 decimator
y4menc:  y4menc: YUV4MPEG video encoder
flac:  flacenc: FLAC audio encoder
flac:  flacdec: FLAC audio decoder
flac:  flactag: FLAC tagger
jpeg:  jpegenc: JPEG image encoder
jpeg:  jpegdec: JPEG image decoder
videocrop:  videocrop: Crop
videocrop:  aspectratiocrop: aspectratiocrop
aasink:  aasink: ASCII art video sink
videomixer:  videomixer: Video mixer 2
videofiltersbad:  scenechange: Scene change detector
videofiltersbad:  zebrastripe: Zebra stripe overlay
videofiltersbad:  videodiff: Video Diff
video4linux2:  v4l2src: Video (video4linux2) Source
video4linux2:  v4l2sink: Video (video4linux2) Sink
video4linux2:  v4l2radio: Radio (video4linux2) Tuner
video4linux2:  v4l2deviceprovider (GstDeviceProviderFactory)
cdio:  cdiocddasrc: CD audio source (CDDA)
mpeg2enc:  mpeg2enc: mpeg2enc video encoder
kms:  kmssink: KMS video sink
rtponvif:  rtponviftimestamp: ONVIF NTP timestamps RTP extension
rtponvif:  rtponvifparse: ONVIF NTP timestamps RTP extension
id3tag:  id3mux: ID3 v1 and v2 Muxer
nvvideo4linux2:  nvv4l2decoder: NVIDIA v4l2 video decoder
nvvideo4linux2:  nvv4l2h264enc: V4L2 H.264 Encoder
nvvideo4linux2:  nvv4l2h265enc: V4L2 H.265 Encoder
nvvideo4linux2:  nvv4l2vp8enc: V4L2 VP8 Encoder
nvvideo4linux2:  nvv4l2vp9enc: V4L2 VP9 Encoder
nvvideo4linux2:  nvv4l2av1enc: V4L2 AV1 Encoder
videofilter:  gamma: Video gamma correction
videofilter:  videobalance: Video balance
videofilter:  videoflip: Video flipper
videofilter:  videomedian: Median effect
decklink:  decklinkaudiosink: Decklink Audio Sink
decklink:  decklinkvideosink: Decklink Video Sink
decklink:  decklinkaudiosrc: Decklink Audio Source
decklink:  decklinkvideosrc: Decklink Video Source
coreelements:  capsfilter: CapsFilter
coreelements:  concat: Concat
coreelements:  dataurisrc: data: URI source element
coreelements:  downloadbuffer: DownloadBuffer
coreelements:  fakesrc: Fake Source
coreelements:  fakesink: Fake Sink
coreelements:  fdsrc: Filedescriptor Source
coreelements:  fdsink: Filedescriptor Sink
coreelements:  filesrc: File Source
coreelements:  funnel: Funnel pipe fitting
coreelements:  identity: Identity
coreelements:  input-selector: Input selector
coreelements:  output-selector: Output selector
coreelements:  queue: Queue
coreelements:  queue2: Queue 2
coreelements:  filesink: File Sink
coreelements:  tee: Tee pipe fitting
coreelements:  typefind: TypeFind
coreelements:  multiqueue: MultiQueue
coreelements:  valve: Valve element
coreelements:  streamiddemux: Streamid Demux
adpcmdec:  adpcmdec: ADPCM decoder
matroska:  matroskademux: Matroska demuxer
matroska:  matroskaparse: Matroska parser
matroska:  matroskamux: Matroska muxer
matroska:  webmmux: WebM muxer
wavparse:  wavparse: WAV audio demuxer
coloreffects:  coloreffects: Color Look-up Table filter
coloreffects:  chromahold: Chroma hold filter
volume:  volume: Volume
vorbis:  vorbisenc: Vorbis audio encoder
vorbis:  vorbisdec: Vorbis audio decoder
vorbis:  vorbisparse: VorbisParse
vorbis:  vorbistag: VorbisTag
mpeg2dec:  mpeg2dec: mpeg1 and mpeg2 video decoder
removesilence:  removesilence: RemoveSilence
x264:  x264enc: x264enc
inter:  interaudiosrc: Internal audio source
inter:  interaudiosink: Internal audio sink
inter:  intersubsrc: Internal subtitle source
inter:  intersubsink: Internal subtitle sink
inter:  intervideosrc: Internal video source
inter:  intervideosink: Internal video sink
shm:  shmsrc: Shared Memory Source
shm:  shmsink: Shared Memory Sink
gdkpixbuf:  gdkpixbufdec: GdkPixbuf image decoder
gdkpixbuf:  gdkpixbufoverlay: GdkPixbuf Overlay
gdkpixbuf:  gdkpixbufsink: GdkPixbuf sink
uvch264:  uvch264mjpgdemux: UVC H264 MJPG Demuxer
uvch264:  uvch264src: UVC H264 Source
aiff:  aiffparse: AIFF audio demuxer
aiff:  aiffmux: AIFF audio muxer
openjpeg:  openjpegdec: OpenJPEG JPEG2000 decoder
openjpeg:  openjpegenc: OpenJPEG JPEG2000 encoder
rtsp:  rtspsrc: RTSP packet receiver
rtsp:  rtpdec: RTP Decoder
level:  level: Level
segmentclip:  audiosegmentclip: Audio buffer segment clipper
segmentclip:  videosegmentclip: Video buffer segment clipper
app:  appsrc: AppSrc
app:  appsink: AppSink
modplug:  modplug: ModPlug
cluttergst3:  clutterautovideosink: Generic bin
videosignal:  videoanalyse: Video analyser
videosignal:  simplevideomarkdetect: Video detecter
videosignal:  simplevideomark: Video marker
shout2:  shout2send: Icecast network sink
curl:  curlhttpsink: Curl http sink
curl:  curlfilesink: Curl file sink
curl:  curlftpsink: Curl ftp sink
curl:  curlsmtpsink: Curl smtp sink
curl:  curlhttpsrc: HTTP Client Source using libcURL
legacyrawparse:  videoparse: Video Parse
legacyrawparse:  audioparse: Audio Parse
dtls:  dtlsenc: DTLS Encoder
dtls:  dtlsdec: DTLS Decoder
dtls:  dtlssrtpdec: DTLS-SRTP Decoder
dtls:  dtlssrtpenc: DTLS-SRTP Encoder
dtls:  dtlssrtpdemux: DTLS SRTP Demultiplexer
nvarguscamerasrc:  nvarguscamerasrc: NvArgusCameraSrc
taglib:  id3v2mux: TagLib-based ID3v2 Muxer
taglib:  apev2mux: TagLib-based APEv2 Muxer
pango:  textoverlay: Text overlay
pango:  timeoverlay: Time overlay
pango:  clockoverlay: Clock overlay
pango:  textrender: Text renderer
vpx:  vp8dec: On2 VP8 Decoder
vpx:  vp8enc: On2 VP8 Encoder
vpx:  vp9dec: On2 VP9 Decoder
vpx:  vp9enc: On2 VP9 Encoder
rfbsrc:  rfbsrc: Rfb source
nveglglessink:  nveglglessink: EGL/GLES vout Sink
fluidsynthmidi:  fluiddec: Fluidsynth
ivtc:  ivtc: Inverse Telecine
ivtc:  combdetect: Comb Detect
dvb:  dvbsrc: DVB Source
dvb:  dvbbasebin: DVB bin
videoparsersbad:  h263parse: H.263 parser
videoparsersbad:  h264parse: H.264 parser
videoparsersbad:  diracparse: Dirac parser
videoparsersbad:  mpegvideoparse: MPEG video elementary stream parser
videoparsersbad:  mpeg4videoparse: MPEG 4 video elementary stream parser
videoparsersbad:  pngparse: PNG parser
videoparsersbad:  jpeg2000parse: JPEG 2000 parser
videoparsersbad:  h265parse: H.265 parser
videoparsersbad:  vc1parse: VC1 parser
proxy:  proxysrc: Proxy source
proxy:  proxysink: Proxy Sink
faad:  faad: AAC audio decoder
icydemux:  icydemux: ICY tag demuxer
festival:  festival: Festival Text-to-Speech synthesizer
audiomixmatrix:  audiomixmatrix: Matrix audio mix
gme:  gmedec: Gaming console music file decoder
isomp4:  qtdemux: QuickTime demuxer
isomp4:  rtpxqtdepay: RTP packet depayloader
isomp4:  qtmux: QuickTime Muxer
isomp4:  mp4mux: MP4 Muxer
isomp4:  ismlmux: ISML Muxer
isomp4:  3gppmux: 3GPP Muxer
isomp4:  mj2mux: MJ2 Muxer
isomp4:  qtmoovrecover: QT Moov Recover
alphacolor:  alphacolor: Alpha color filter
twolame:  twolamemp2enc: TwoLAME mp2 encoder
voamrwbenc:  voamrwbenc: AMR-WB audio encoder
interleave:  interleave: Audio interleaver
interleave:  deinterleave: Audio deinterleaver
nvcompositor:  nvcompositor: NvCompositor
gio:  giosink: GIO sink
gio:  giosrc: GIO source
gio:  giostreamsink: GIO stream sink
gio:  giostreamsrc: GIO stream source
opusparse:  opusparse: Opus audio parser
spandsp:  spanplc: SpanDSP PLC
spandsp:  dtmfdetect: DTMF detector element
spandsp:  tonegeneratesrc: Telephony Tone  Generator source
ivfparse:  ivfparse: IVF parser
asf:  asfdemux: ASF Demuxer
asf:  rtspwms: WMS RTSP Extension
asf:  rtpasfdepay: RTP ASF packet depayloader
x265:  x265enc: x265enc
accurip:  accurip: AccurateRip(TM) CRC element
pulseaudio:  pulsesink: PulseAudio Audio Sink
pulseaudio:  pulsesrc: PulseAudio Audio Source
pulseaudio:  pulsedeviceprovider (GstDeviceProviderFactory)
smoothstreaming:  mssdemux: Smooth Streaming demuxer
freeverb:  freeverb: Reverberation/room effect
srt:  srtsrc: SRT source
srt:  srtsink: SRT sink
srt:  srtclientsrc: SRT source
srt:  srtserversrc: SRT source
srt:  srtclientsink: SRT sink
srt:  srtserversink: SRT sink
debugutilsbad:  checksumsink: Checksum sink
debugutilsbad:  fpsdisplaysink: Measure and show framerate on videosink
debugutilsbad:  chopmydata: FIXME
debugutilsbad:  compare: Compare buffers
debugutilsbad:  debugspy: DebugSpy
debugutilsbad:  watchdog: Watchdog
debugutilsbad:  errorignore: Convert some GstFlowReturn types into others
debugutilsbad:  fakevideosink: Fake Video Sink
debugutilsbad:  testsrcbin: Generic bin
rsvg:  rsvgoverlay: RSVG overlay
rsvg:  rsvgdec: SVG image decoder
realmedia:  rmdemux: RealMedia Demuxer
realmedia:  rademux: RealAudio Demuxer
realmedia:  rdtdepay: RDT packet parser
realmedia:  rdtmanager: RTP Decoder
realmedia:  rtspreal: RealMedia RTSP Extension
realmedia:  pnmsrc: PNM packet receiver
playback:  playbin: Player Bin 2
playback:  playbin3: Player Bin 3
playback:  playsink: Player Sink
playback:  subtitleoverlay: Subtitle Overlay
playback:  streamsynchronizer: Stream Synchronizer
playback:  decodebin: Decoder Bin
playback:  decodebin3: Decoder Bin 3
playback:  uridecodebin: URI Decoder
playback:  uridecodebin3: URI Decoder
playback:  urisourcebin: URI reader
playback:  parsebin: Parse Bin
sbc:  sbcdec: Bluetooth SBC audio decoder
sbc:  sbcenc: Bluetooth SBC audio encoder
sdpelem:  sdpdemux: SDP session setup
sdpelem:  sdpsrc: SDP Source
bluez:  a2dpsink: Bluetooth A2DP sink
bluez:  avdtpsink: Bluetooth AVDTP sink
bluez:  avdtpsrc: Bluetooth AVDTP Source
soup:  souphttpsrc: HTTP client source
soup:  souphttpclientsink: HTTP client sink
staticelements:  bin: Generic bin
staticelements:  pipeline: Pipeline object

Total count: 263 plugins (3 blacklist entries not shown), 857 features

`;

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
            const gstMonitorOutput = await fs.readFile('./test/qualcomm-rb3-monitor-brio.txt', { encoding: 'utf-8' });
            const gstInspectOutput = await fs.readFile('./test/qualcomm-rb3-inspect.txt', { encoding: 'utf-8' });
            const gstInspectOutputQti = await fs.readFile('./test/qualcomm-rb3-inspect-qtiqmmfsrc.txt', { encoding: 'utf-8' });

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
            assert.equal(devices.length, 4);
            assert.equal(devices[2].id, 'qtiqmmfsrc-0');
            assert.equal(devices[2].name, 'Camera 0 (High-resolution, fisheye, IMX577) (qtiqmmfsrc-0)');
            assert.equal(devices[2].videoSource, 'qtiqmmfsrc name=camsrc camera=0');
            assert.equal(JSON.stringify(devices[2].caps), JSON.stringify([
                {
                    type: "video/x-raw",
                    width: 1280,
                    height: 720,
                    framerate: 30,
                },
            ]));
            assert.equal(devices[0].id, '/dev/video2');
            assert.equal(devices[0].name, 'Logitech BRIO (/dev/video2)');
            assert.equal(devices[0].videoSource, 'v4l2src');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([
                {
                    "type": "video/x-raw",
                    "width": 1920,
                    "height": 1080,
                    "framerate": 5
                  },
                  {
                    "type": "video/x-raw",
                    "width": 1600,
                    "height": 896,
                    "framerate": 15
                  },
                  {
                    "type": "video/x-raw",
                    "width": 1280,
                    "height": 720,
                    "framerate": 10
                  },
                  {
                    "type": "video/x-raw",
                    "width": 1024,
                    "height": 576,
                    "framerate": 15
                  },
                  {
                    "type": "video/x-raw",
                    "width": 960,
                    "height": 540,
                    "framerate": 15
                  },
                  {
                    "type": "video/x-raw",
                    "width": 800,
                    "height": 600,
                    "framerate": 24
                  },
                  {
                    "type": "video/x-raw",
                    "width": 848,
                    "height": 480,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 800,
                    "height": 448,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 640,
                    "height": 480,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 640,
                    "height": 360,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 440,
                    "height": 440,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 480,
                    "height": 270,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 340,
                    "height": 340,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 424,
                    "height": 240,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 352,
                    "height": 288,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 320,
                    "height": 240,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 320,
                    "height": 180,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 176,
                    "height": 144,
                    "framerate": 30
                  },
                  {
                    "type": "video/x-raw",
                    "width": 160,
                    "height": 120,
                    "framerate": 30
                  },
                  {
                    "type": "image/jpeg",
                    "width": 1920,
                    "height": 1080,
                    "framerate": 30
                  },
                  {
                    "type": "image/jpeg",
                    "width": 1600,
                    "height": 896,
                    "framerate": 30
                  },
                  {
                    "type": "image/jpeg",
                    "width": 1280,
                    "height": 720,
                    "framerate": 60
                  },
                  {
                    "type": "image/jpeg",
                    "width": 1024,
                    "height": 576,
                    "framerate": 30
                  },
                  {
                    "type": "image/jpeg",
                    "width": 960,
                    "height": 540,
                    "framerate": 30
                  },
                  {
                    "type": "image/jpeg",
                    "width": 800,
                    "height": 600,
                    "framerate": 30
                  }
            ]));
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
                scaleAndCropInPipeline: true,
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

            assert.equal(launchResp.invokeProcess, 'spawn');
            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.args.join(' '),
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! jpegenc ! multifilesink location=test%05d.jpg');
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
                scaleAndCropInPipeline: true,
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

            assert.equal(launchResp.invokeProcess, 'spawn');
            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.args.join(' '),
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! videocrop left=180 right=180 ! videoscale method=lanczos ! video/x-raw,width=320,height=320 ! jpegenc ! multifilesink location=test%05d.jpg');
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
                scaleAndCropInPipeline: true,
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

            assert.equal(launchResp.invokeProcess, 'spawn');
            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.args.join(' '),
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! videoscale method=lanczos ! video/x-raw,width=320,height=320 ! jpegenc ! multifilesink location=test%05d.jpg');
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
                scaleAndCropInPipeline: true,
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

            assert.equal(launchResp.invokeProcess, 'spawn');
            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.args.join(' '),
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! jpegenc ! multifilesink location=test%05d.jpg');
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
                scaleAndCropInPipeline: undefined,
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

            assert.equal(launchResp.invokeProcess, 'spawn');
            assert.equal(launchResp.command, 'gst-launch-1.0');
            assert.equal(launchResp.args.join(' '),
                'pylonsrc ! video/x-raw,width=1440,height=1080 ! videoconvert ! jpegenc ! multifilesink location=test%05d.jpg');
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

        // console.log('testGetDevices', 'command', command, 'args', args);

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
        scaleAndCropInPipeline: true,
    });
    await gstreamer.init();
    const devices = await gstreamer.getAllDevices();
    return devices;
}
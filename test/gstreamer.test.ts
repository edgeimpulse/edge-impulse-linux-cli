import assert from "assert";
import {
    GStreamer
} from "../library/sensors/gstreamer";
import {
    SpawnHelperType
} from "../library/sensors/spawn-helper";

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

            const devices = await testGetDevices(gstOutput, gstLaunchNvargusCameraSrcOutput);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, 'nvarguscamerasrc');
            assert.equal(devices[0].name, 'CSI camera');
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

            const devices = await testGetDevices(gstOutput, gstLaunchNvargusCameraSrcOutput);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'C922 Pro Stream Webcam');
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'USB');
            assert.equal(JSON.stringify(devices[0].caps), JSON.stringify([{
                type: "image/jpeg",
                width: 1280,
                height: 720,
                framerate: 30
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'i.MX6S_CSI');
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'UvcH264 Video Capture 4 (/dev/video0)');
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video1');
            assert.equal(devices[0].name, 'HD Pro Webcam C920');
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'RZG2L_CRU');
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

            const devices = await testGetDevices(gstOutput, undefined);

            assert.equal(devices.length, 1);
            assert.equal(devices[0].id, '/dev/video0');
            assert.equal(devices[0].name, 'UvcH264 C922 Pro Stream Webcam (/dev/video0)');
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
                }
            ]));
        });
    });
});

async function testGetDevices(gstOutput: string, gstLaunchNvargusCameraSrcOutput: string | undefined) {
    const spawnHelper: SpawnHelperType = async (command: string,
        args: string[],
        opts: {
            ignoreErrors: boolean,
            cwd ? : string
        } = {
            ignoreErrors: false
        }) => {

        if (command === 'which') {
            return '';
        } else if (command === 'gst-device-monitor-1.0') {
            return gstOutput;
        } else if (command === 'gst-inspect-1.0') {
            return 'nvarguscamerasrc'; // nvidia probing
        } else if (command === 'gst-launch-1.0' && args[0] === 'nvarguscamerasrc') {
            return gstLaunchNvargusCameraSrcOutput || '';
        } else {
            throw new Error('spawnHelper failed on ' + command + ' ' + args.join(' '));
        }
    };

    const gstreamer = new GStreamer(false, spawnHelper);
    await gstreamer.init();
    const devices = await gstreamer.getAllDevices();
    return devices;
}
import { MovingAverageFilter } from "./moving-average-filter";
import { DataForwarder } from './data-forwarder';
import { ips } from './get-ips';
import { LinuxImpulseRunner } from "./classifier/linux-impulse-runner";
import { AudioClassifier } from "./classifier/audio-classifier";
import { ImageClassifier } from "./classifier/image-classifier";
import { GStreamer } from "./sensors/gstreamer";
import { Imagesnap } from "./sensors/imagesnap";
import { AudioRecorder } from "./sensors/recorder";
import { ICamera } from "./sensors/icamera";

export { MovingAverageFilter };
export { DataForwarder };
export { AudioClassifier };
export { ImageClassifier };
export { LinuxImpulseRunner };
export { GStreamer as Ffmpeg };
export { Imagesnap };
export { AudioRecorder };
export { ICamera };
export function getIps() {
    return ips;
}

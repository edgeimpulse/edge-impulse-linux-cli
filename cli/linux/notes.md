Required objects for Linux/Runner


configFactory

RunnerDownloader
ModelMonitor
RemoteMgmt
LinuxDevice

LinuxImpulseRunner
AudioClassifier / ImageClassifier





Linux APP:

1. Ingestion mode:
* load config
* login to Studio
* init LinuxDevice
* init RemoteMgmt
* init sensors (mic &/or camera)
* connect RemoteMgmt


2. Inference mode
* load config
* login to studio (if no model provided only OR if monitor is active)

* (option) download model
* open model file
* init ImpulseRunner
* (option) init LinuxDevice & Monitor & RemoteMgmt & connect RemoteMgmt
* init sensors (mic OR camera)



TODO:
--runner
efter selecting project, the app is asking for mic (not matter what project I selected)


Audio init:
Load from config
Select if not available or not init before (user query)
Store in the config
RESULT: audio device name (string)

Camera:
Load from config
Init (depend on type: GStreamer, Propheseer, Imagesnap)
Select camera (if not available)
Start camera
RESULT: camera object


Ingestion audio:
1. Get list of audio devices
2. Get last audio from config

Inference audio:
1. Camera allowed? Start
2. Get last audio from config
3. No audio dev? init dev
4. Store audio dev in config
5. Create AudioClassifier



TESTS (*linux)
1. Connect, no params, user/pass auth, select project, connected to ingestion
check if visible in devices
2. Ingest data using available sensors
3. Setting camera dimensions - test if the proper dimensions are displayed on the list of ingestion sensors
4. Running local inference (offline mode, --model-file, no connection required)
5. Download model with forced target (test via file model.eim the arch)
6. Forces engine (how to check?)
7. Downloads quantized model (how to test?)
8. Monitor (check status on the Devices page)

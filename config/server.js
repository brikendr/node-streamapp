var path = require('path');

module.exports = {
    staticFolder: path.join(__dirname + '/../client'),
    STREAM_PORT: 5000,
	WEBSOCKET_PORT: 5001,
    spawnedFFMEG: false,
    captureDevice: detectCaptureDevice(),
    ffmpegPath: "ffmpeg"
}

function detectCaptureDevice() {
    if (process.platform == "win32") { //Windows OS
        return {
            'f': 'vfwcap',
            'i': '0'
        };
    }
    else if (process.platform == "linux") { //Linux OS
        return {
            'f': 'video4linux2',
            'i': '/dev/video0'
        };
    } else {// MAC OS 
        return {
            'f': 'v4l2',
            'i': '/dev/video0'
        };
    }
}
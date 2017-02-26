var express = require('express')
,   http    = require('http')
,   morgan  = require('morgan')
,   spawn   = require('child_process').spawn
,   ffmpeg  = null;

// Configuration File
var config = require('./config/server');

if (process.platform == "win32" && process.argv.length < 3) {
    if (process.platform == "win32") {
        console.log(
            'Usage: \n' +
            'npm start <path to ffmpeg.exe Ex: C://ffmpeg//bin//ffmpeg>'
        );
        process.exit();
    }
	
} else if(process.platform == "win32" && process.argv.length == 3) {
    config.ffmpegPath = process.argv[2];
}

/* ----------------------------- CLINET SERVER ----------------------------------- */
// Client Application Parameters --Optional-- 
var app = express();
app.set('port', config.WEBSOCKET_PORT);
app.use(express.static(config.staticFolder));
app.use(morgan('dev'));

// Server index.html page through the index.js route file 
require('./routes').serveIndex(app, config.staticFolder);

// Create the HTTP server for the client
var server = http.createServer(app);
server.listen(app.get('port'), function(){
    console.log('Huddly Client Server is listening on port: '+app.get('port'));
});

/* ----------------------------- END CLINET SERVER ----------------------------------- */



/* ----------------------------- WEBSOCKET SERVER ----------------------------------- */
var io = require('socket.io')(server);
var connections = 0;
io.on('connection', function(socket){
    connections++;
    console.log('New Connection Joined. Total connections '+connections);

    // Check if the server has spawned the FFMPEG stream 
    if(!config.spawnedFFMEG) {
        //Spawn the stream 
        spawnStream();
        // Set boolean to true
        config.spawnedFFMEG = true;
    }
    socket.on('disconnect', function(){
        connections--;
        console.log('A socket has been disconnected. Total connections '+connections);
        if(connections == 0) {
            // Kill the stream 
            //ffmpeg.disconnect();

            // Set boolean to false
            config.spawnedFFMEG = false;
        }
    });
});
io.broadcast = function(data) {
    io.sockets.emit('frame', data);
}
console.log('Awaiting Socket connections on http://127.0.0.1:'+config.WEBSOCKET_PORT+'/');
/* ----------------------------- WEBSOCKET SERVER ----------------------------------- */



/* ----------------------------- STREAM SERVER ----------------------------------- */
// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
var streamServer = http.createServer( function(request, response) {
	
	response.connection.setTimeout(0);
	console.log(
		'Stream Connected: ' + 
		request.socket.remoteAddress + ':' +
		request.socket.remotePort
	);
	request.on('data', function(data){
		io.broadcast(data);
	});
	request.on('end',function(){
		console.log('close');
	});
}).listen(config.STREAM_PORT);
console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+config.STREAM_PORT);
/* ----------------------------- END STREAM SERVER ----------------------------------- */


var spawnStream = function() {
    console.log("====Spawning ffmpeg stream for the first time=====");
    console.log(config.ffmpegPath);
    console.log(config.captureDevice.f);
    ffmpeg = spawn(config.ffmpegPath, ["-f", config.captureDevice.f, "-s", "640x480", "-r", "30", "-i", config.captureDevice.i, "-f", "mpeg1video", "-b", "800k", "http://127.0.0.1:5000"]);
    
    /*ffmpeg.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });*/

    ffmpeg.on('close', (code) => {
        console.log(`====== ffmpeg stream process has ended ${code}========`);
    });
}

module.exports.app = app;
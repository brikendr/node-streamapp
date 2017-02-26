# node-streamapp
Nodejs application for streaming the camera video feed over tcp web sockets using Socket.io module. 

The application depends on the ffmpeg library which captures the web camera and streams it over a websocket. Ffmpeg starts capturing the webcam video in 640x480 and encodes an MPEG video with 30fps and a bitrate of 800kbit/s.

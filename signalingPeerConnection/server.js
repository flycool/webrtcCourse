const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname));

const key = fs.readFileSync('create-cert-key.pem');
const cert = fs.readFileSync('create-cert.pem');

const expressServer = https.createServer({ key, cert }, app);
const io = socketio(expressServer);

expressServer.listen(5050);

io.on('connection', (socket) => {
    console.log("Someone has connected");
});
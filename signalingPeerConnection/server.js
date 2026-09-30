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

const offers = [
    // offerUserName
    // offer
    // offerIceCandidates
    // answerUserName
    // answer
    // answerIceCandidates
];

const connectedSockets = [
    //username, socketId
];

io.on('connection', (socket) => {
    // console.log("Someone has connected");
    const userName = socket.handshake.auth.userName;
    const password = socket.handshake.auth.password;

    if (password !== 'x') {
        socket.disconnect(true);
        return;
    }

    connectedSockets.push({
        socketId: socket.id,
        userName
    });

    socket.on('newOffer', newOffer => {
        offers.push({
            offerUserName: userName,
            offer: newOffer,
            offerIceCandidates: [],
            answerUserName: null,
            answer: null,
            answerIceCandidates: []
        })
        // console.log(offers)
        // send out to all connected sockets EXCEPT the caller
        socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));
    });

    // a new client has join. If there are any offers availiable, emit them out
    if(offers.length) {
        socket.emit("availableOffers", offers);
    }

    socket.on('iceCandidate', iceCandidateObj => {
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
        // console.log(iceCandidate);
        if(didIOffer) {
            const offerInOffers = offers.find(o=>o.offerUserName === iceUserName);
            if(offerInOffers) {
                offerInOffers.offerIceCandidates.push(iceCandidate);
            }
        }

    })
});
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const socketio = require('socket.io');
app.use(express.static(__dirname));

const key = fs.readFileSync('create-cert-key.pem');
const cert = fs.readFileSync('create-cert.pem');

const expressServer = https.createServer({ key, cert }, app);
// create socket.io server
const io = socketio(expressServer, {
    cors: {
        origin: [
            "https://localhost",
            "https://192.168.1.10"
        ],
        methods: ["GET", "POST"],
    }
});

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

    socket.on('newAnswer', (offerObj, ackFunction) => {
        console.log("newAnswer===", offerObj);
        // emit the answer to the user who made the offer
        const socketToAnswer = connectedSockets.find(s => s.userName === offerObj.offerUserName);
        if (!socketToAnswer) {
            console.log("No matching socket");
            return;
        }
        const socketIdToAnswer = socketToAnswer.socketId;
        const offerToUpdate = offers.find(o => o.offerUserName === offerObj.offerUserName);
        if (!offerToUpdate) {
            console.log("No offerToUpdate");
            return;
        }
        //send back to the answerer all the ice candidates that the offerer has collected so far
        ackFunction(offerToUpdate.offerIceCandidates);
        offerToUpdate.answer = offerObj.answer;
        offerToUpdate.answerUserName = userName;

        socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
    });

    // a new client has join. If there are any offers availiable, emit them out
    if (offers.length) {
        socket.emit("availableOffers", offers);
    }

    socket.on('iceCandidate', iceCandidateObj => {
        const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
        // console.log(iceCandidate);
        if (didIOffer) {
            const offerInOffers = offers.find(o => o.offerUserName === iceUserName);
            if (offerInOffers) {
                offerInOffers.offerIceCandidates.push(iceCandidate);

                if (offerInOffers.answerUserName) {
                    const socketToSendTo = connectedSockets.find(s => s.userName === offerInOffers.answerUserName);
                    if (socketToSendTo) {
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromeServer', iceCandidate)
                    }
                }
            }
        } else {
            const offerInOffers = offers.find(o => o.answerUserName === iceUserName);
            const socketToSendTo = connectedSockets.find(s => s.userName === offerInOffers.offerUserName);
            if (socketToSendTo) {
                socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromeServer', iceCandidate)
            }
        }

    })
});
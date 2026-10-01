const userName = "Max-" + Math.floor(Math.random() * 100000);
const password = 'x';
document.querySelector('#user-name').innerHTML = userName;

const socket = io.connect('https://localhost:5050', {
    auth: {
        userName, password
    }
});

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;

let peerConfiguration = {
    iceServers: [
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}


const call = async () => {
    await fetchUserMedia();
    await createPeerConnection();

    try {
        console.log("creating offer....");
        const offer = await peerConnection.createOffer();
        console.log("offer", offer);
        peerConnection.setLocalDescription(offer);
        didIOffer = true;
        socket.emit('newOffer', offer); // send off to signal server

    } catch (error) {
        console.error("Error occurred:", error);
    }
}

const answerOffer = async (offerObj) => {
    // console.log("answerOffer===", offerObj);
    await fetchUserMedia();
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer();
    console.log("answer===", answer)
    peerConnection.setLocalDescription(answer);

    // emit the answer to the signaling server
    offerObj.answer = answer;
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    console.log("offerIceCandidates===", offerIceCandidates);

    offerIceCandidates.forEach(c => {
        peerConnection.addIceCandidate(c);
        console.log("==========added ice candidate=======");
    });

}

const addAnswer = async (offerObj) => {
    peerConnection.setRemoteDescription(offerObj.answer);
}

const fetchUserMedia = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            localVideoEl.srcObject = stream;
            localStream = stream;
            resolve();
        } catch (error) {
            console.log("fetchUserMedia", error);
            reject();
        }
    })
}

const createPeerConnection = (offerObj) => {
    return new Promise(async (resolve, reject) => {
        peerConnection = await new RTCPeerConnection(peerConfiguration);

        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener('signalingstatechange', (event) => {
            console.log(event);
            console.log(peerConnection.signalingState);
        })

        peerConnection.addEventListener('icecandidate', e => {
            console.log("Ice candidate found....");
            console.log("icecandidate", e);
            if (e.candidate) {
                socket.emit('iceCandidate', {
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                });
            }
        });

        peerConnection.addEventListener('track', e => {
            console.log("peerConnection track===", e)
            e.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track, remoteStream);
            })
        });

        if (offerObj) {
            peerConnection.setRemoteDescription(offerObj.offer);
        }

        resolve();
    })
}

const addNewIceCandidate = (iceCandidate) => {
    peerConnection.addIceCandidate(iceCandidate);
    console.log("==addNewIceCandidate========added ice candidate=======");
}


document.querySelector('#call').addEventListener('click', call);
const socket = io.connect('https://localhost:5050');

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;
let peerConnection;

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
    let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
    localVideoEl.srcObject = stream;
    localStream = stream;

    await createPeerConnection();

    try {
        console.log("creating offer....");
        const offer = await peerConnection.createOffer();
        console.log("offer", offer);
        peerConnection.setLocalDescription(offer);
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

const createPeerConnection = () => {
    return new Promise(async (resolve, reject) => {
        peerConnection = await new RTCPeerConnection(peerConfiguration);
        peerConnection.addEventListener('icecandidate', e => {
            console.log("Ice candidate found....");
            console.log("icecandidate", e);
        });

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        resolve();
    })
}




document.querySelector('#call').addEventListener('click', call);
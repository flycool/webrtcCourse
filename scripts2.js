'use strict';

const videoEl = document.querySelector('#my-video');
let stream = null;
let mediaStream = null; // use for share screen
const constraints = {
    audio: true,
    video: true
}

async function getMicAndCamera() {
    console.log("isSecureContext:", window.isSecureContext);

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("stream", stream);
        getDevices();
        changeButtons(['green', 'blue', 'blue', 'grey', 'grey', 'grey', 'grey', 'grey']);
    } catch (error) {
        console.log("error", error);
        console.log("user denied access to constraints");
    }
}

const showMyFeed = (e) => {
    console.log("show my feed");
    if (!stream) {
        alert("Stream still loading...");
        return;
    }
    videoEl.srcObject = stream;
    changeButtons(['green', 'green', 'blue', 'blue', 'blue', 'grey', 'grey', 'blue']);
}

const stopMyFeed = (e) => {
    if (!stream) {
        alert("Stream still loading...");
        return;
    } 
    const tracks = stream.getTracks();
    tracks.forEach(track => {
        console.log("track", track);
        track.stop();
    });
    changeButtons(['blue', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey', 'grey']);
}


document.querySelector('#share').addEventListener('click', e => getMicAndCamera(e));
document.querySelector('#show-video').addEventListener('click', e => showMyFeed(e));
document.querySelector('#stop-video').addEventListener('click', e => stopMyFeed(e));
document.querySelector('#change-size').addEventListener('click', e => changeVideoSize(e));
document.querySelector('#start-record').addEventListener('click', e => startRecording(e));
document.querySelector('#stop-record').addEventListener('click', e => stopRecording(e));
document.querySelector('#play-record').addEventListener('click', e => playRecording(e));
document.querySelector('#share-screen').addEventListener('click', e => shareScreen(e));

document.querySelector('#audio-input').addEventListener('change', e=>changeAudioInput(e));
document.querySelector('#audio-output').addEventListener('change', e=>changeAudioOutput(e));
document.querySelector('#video-input').addEventListener('change', e=>changeVideo(e));
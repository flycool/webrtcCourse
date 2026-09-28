const audioInputEl = document.querySelector('#audio-input');
const audioOutputEl = document.querySelector('#audio-output');
const videoInputEl = document.querySelector('#video-input');

const getDevices = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log("devices", devices);

        devices.forEach(d => {
            const option = document.createElement('option');
            option.value = d.deviceId;
            option.text = d.label;
            if (d.kind === 'audioinput') {
                audioInputEl.appendChild(option);
            } else if (d.kind === 'audiooutput') {
                audioOutputEl.appendChild(option);
            } else if (d.kind === 'videoinput') {
                videoInputEl.appendChild(option);
            }
        });

    } catch (error) {
        console.log("error", error);
    }
}

const changeAudioInput = async (e) => {
    const deviceId = e.target.value;
    const constraints = {
        audio: { deviceId: { exact: deviceId } },
        video: true
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getAudioTracks().forEach(track => {
            console.log("audio track", track);
        });
    } catch (error) {
        console.log("error", error);
    }
}

const changeAudioOutput = async (e) => {
    await videoEl.setSinkId(e.target.value);
    console.log("set audio output");
}

const changeVideo = async (e) => {
    const deviceId = e.target.value;
    const constraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    }
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getVideoTracks().forEach(track => {
            console.log("video track", track);
        });
    } catch (error) {
        console.log("error", error);
    }
}

getDevices();
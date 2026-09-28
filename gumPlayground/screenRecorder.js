let mediaRecorder;
let recordedBlobs;

const startRecording = () => {
    if (!stream) {
        alert("No current feed");
        return;
    }
    recordedBlobs = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
        // ondataavailable will run when stream ends, or stopped, or we specifically ask for it
        console.log("data is available for media recorder");
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }
    mediaRecorder.start();
    changeButtons(['green', 'green', 'blue', 'blue', 'green', 'blue', 'grey', 'blue']);
}

const stopRecording = () => {
    if (!mediaRecorder) {
        alert("Please record first");
        return;
    }
    mediaRecorder.stop();
    changeButtons(['green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'blue']);
}

const playRecording = () => {
     if (!recordedBlobs) {
        alert("No recording saved");
        return;
    }
    const superBuffer = new Blob(recordedBlobs);
    const recordedVideoEl = document.querySelector('#other-video');
    recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
    recordedVideoEl.controls = true;
    recordedVideoEl.play();
    changeButtons(['green', 'green', 'blue', 'blue', 'green', 'green', 'green', 'blue']);
}
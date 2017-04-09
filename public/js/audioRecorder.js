var recordBtn, stopBtn, audioDiv = null; 
var mediaRecorder = null;
var chunks = [];

function configMediaRecorder(stream){
    mediaRecorder = new MediaRecorder(stream);    

    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    }
    
    mediaRecorder.onstop = function(e) {

        var audio = document.createElement('audio');
        var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
        var audioURL = window.URL.createObjectURL(blob);

        audio.setAttribute('id', 'newAudio');
        audio.src = audioURL;
        audioDiv.appendChild(audio);

        chunks = [];
    }
}

function getAudioDevice(){
    navigator.getUserMedia = navigator.getUserMedia ||
                             navigator.mozGetUserMedia ||
                             navigator.webkitGetUserMedia;
    
    if (!navigator.getUserMedia) {
        console.log("GetUserMedia is not supported");
        return;
    }

    navigator.getUserMedia( { "audio": "true" }, configMediaRecorder,
        function(err) {
            console.log('getUserMedia deu erro: ' + err);
        });
}

function startRecording(){
    mediaRecorder.start();
    console.log(mediaRecorder.state);
}

function stopRecording(){
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
}

function initClientAudio(){
    audioDiv  = document.querySelector('#audioDiv');
    getAudioDevice();
}

window.addEventListener('load', initClientAudio, false);
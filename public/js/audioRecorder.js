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

        audio.setAttribute('controls', '');
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
    recordBtn.style.background = "red";  //1)MUDA IÇO DEPOI PQ TÀ LOKO, É MT FEIO
    recordBtn.style.color = "white";     //2)quando mudar o 1, ja delata o (2),  (3) e o (4)
}

function stopRecording(){
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    recordBtn.style.background = ""; //3)
    recordBtn.style.color = "";      //4)
}

function initClientAudio(){
    recordBtn = document.querySelector('#startRecording');
    stopBtn   = document.querySelector('#stopRecording');
    audioDiv  = document.querySelector('#audioDiv');
    getAudioDevice();

    recordBtn.onclick = startRecording;
    stopBtn.onclick = stopRecording;    
}

window.addEventListener('load', initClientAudio, false);
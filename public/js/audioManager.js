var micBtn, micShape, playBtn, trashBtn = null;
var isRecording = false;

function initAudioManager(){
    micBtn   = document.querySelector('#micBtn');
    micShape = document.querySelector('#micShape');
    playBtn  = document.querySelector('#playBtn');
    trashBtn = document.querySelector('#trashBtn');
    
    micBtn.onclick   = toggleRecording;
    playBtn.onclick  = playAudio; 
    trashBtn.onclick = deleteAudio; 
}

function toggleRecording(){
    if(isRecording){
        micBtn.classList.add('icon-green');
        micBtn.classList.remove('icon-dark');
        micShape.classList.add('media-shape-dark');
        micShape.classList.remove('media-shape-green');         
        playBtn.classList.remove('hidden');       
        trashBtn.classList.remove('hidden');               
        isRecording = false;

        stopRecording();
    }else{
        micBtn.classList.add('icon-dark');
        micBtn.classList.remove('icon-green');
        micShape.classList.add('media-shape-green');
        micShape.classList.remove('media-shape-dark');        
        isRecording = true;
        startRecording();
    }

}

function playAudio(){
    document.querySelector('#newAudio').play();
}

function deleteAudio(){
    var audioToBeDeleted = document.getElementById('#newAudio');
    audioToBeDeleted.outerHTML = "";
    delete audioToBeDeleted;
    playBtn.classList.add('hidden');       
    trashBtn.classList.add('hidden');      
}

window.addEventListener('load', initAudioManager, false);
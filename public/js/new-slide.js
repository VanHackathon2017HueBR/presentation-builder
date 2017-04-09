$(function(){

    var newPdfUpload = document.getElementById('new-pdf');

    newPdfUpload.onchange = function(ev) {
        new NewSlide().add();
    }

});

function NewSlide(){
    this.add = function(){
        upload('new-pdf');
    }
}
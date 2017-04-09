$(function(){

   // var newImgUpload = document.getElementById('new-img');
/*
    newImgUpload.onchange = function(ev) {
        var slide = new NewSlide();
        slide.add(ev);
        slide.closeModal();
    }*/

});

function NewSlide(){
    function add(ev){
        uploadImg(ev);
    }

    function closeModal(){
        $("#add-slide").modal("hide");
    }

    return {
        add: add(),
        closeModal: closeModal()
    }
}
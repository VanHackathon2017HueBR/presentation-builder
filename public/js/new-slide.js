$(function(){

    //var newPdfUpload = document.getElementById('new-pdf');

    // newPdfUpload.onchange = function(ev) {
    //     new NewSlide().add();
    // }

});

function NewSlide(){
   var numItems = $('.image-thumbnail').length;
   if (numItems < 20){
    this.add = function(){
    //  upload('new-pdf');
    }
  }
  else{
    $("#div-error").show();
  }
}

$(function(){

    $(".flaticon-add").click(function(){
        new NewSlide().add();
    });

    
});

function NewSlide(){
    this.add = function(){
        console.log("click");
    }
}
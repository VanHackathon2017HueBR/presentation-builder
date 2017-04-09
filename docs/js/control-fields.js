function openRegistration(button){
  $('div.login-container').fadeIn(1000).removeClass('hidden');
  button.disabled = true;
}

function getFile(){
  $('#pdf').click();
}

function changePDF(button){
  $("#file").hide();
  $("#success").show();
  $("#div-start").show();
}

function changeDivs(){
  $("#landing-page").hide();
  $("#page-content").show();
}

function openRegistration(){
  $('div.login-container').fadeIn(1000).removeClass('hidden');
  $('#start').hide();
}

function getFile(){
  $('#pdf').click();
}

function changePDF(button){
  $("#upload-file-info").html($(button).val());
  $("#file").hide();
  $("#success").show();
  $("#div-start").show();
}

function changeDivs(){
  $("#landing-page").hide();
  $("#page-content").show();
}

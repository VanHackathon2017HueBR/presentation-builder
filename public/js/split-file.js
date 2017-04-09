
$(function() {

    PDFJS.disableWorker = true;

    // Asynchronous download PDF as an ArrayBuffer
    var pdfUpload = document.getElementById('pdf');
    pdfUpload.onchange = function(event) {
        upload('pdf');
        changePDF(document.getElementById('pdf'));
    }

    var imgUpload = document.getElementById('new-img');
    imgUpload.onchange = function (event){
        uploadImg(event);
    }
    //delete slide button object
    var deleteSlideBtn = document.getElementById('deleteBtn');
    
    deleteSlideBtn.onmouseover = function(){
        document.getElementById('slide-viewer').classList.add('delete-opacity');
    }
    deleteSlideBtn.onmouseleave = function(){
        document.getElementById('slide-viewer').classList.remove('delete-opacity');
    }

    $('#preview-modal').on('show.bs.modal', function (e) {
        preview();
    })

});

var selectedPage = "";

var indexCanvas = 1;
var mapPages = new Map();

function addMapFile(keyPage, page){
    mapPages.set(keyPage, page);
}

function upload(selectorUploader){
    if (file = document.getElementById(selectorUploader).files[0]) {
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
            PDFJS.getDocument(fileReader.result).then(function(pdf) {
                if (pdf.numPages) {
                    for (var index = 1; index <= pdf.numPages; index++) {
                        renderPageCarousel(pdf, index);
                    }
                }
            }, function(error) {
                console.log(error);
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
}

function uploadImg(e){
    var numItems = $('.image-thumbnail').length;
    if (numItems < 20){
      var keyPageImg = nextKeyPage();
      var canvas = addCanvas(keyPageImg);
      var ctx = canvas.getContext('2d');
      var img = new Image;

      img.onload = function() {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0,0);
          addMapFile(keyPageImg, img);
          applySortable();
          closeModal();
      }
      img.src = URL.createObjectURL(e.target.files[0]);
    }
    else{
      $("#div-error").show();
    }
}

function closeModal(){
    $("#add-slide").modal("hide");
}

function renderImg(img){
    var canvas = document.getElementById("selected-page");
    var ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0,0);
}

function nextKeyPage(){
    return "page-" + indexCanvas++;
}


function renderPage(keyPage){
    var element = mapPages.get(keyPage);
    selectedPage = keyPage;
    if(element.pageInfo){
        renderPageSelected(mapPages.get(keyPage));
    }else{
        renderImg(element);
    }
}

function renderPageSelected(page){
    var scale = 0.6;
    var canvas = document.getElementById("selected-page");
    renderCanvas(canvas, scale, page);
}

function renderPageCarousel(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.2;
        var keyPage = nextKeyPage();
        var canvas = addCanvas(keyPage);

        renderCanvas(canvas, scale, page);

        savePage(keyPage, page);

        addMapFile(keyPage, page);
        applySortable();
        
        if(pdf.numPages === pageNumber){
            onRenderLastPageCarousel();
        }
    });
}

function onRenderLastPageCarousel(){
    selectFirstPage();
}

function applySortable(){
    Sortable({
            els: 'canvas.image-thumbnail'
    });
}

function renderCanvas(canvas, scale, page){
    var viewport = page.getViewport(scale);

    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var task = page.render({
        canvasContext: context,
        viewport: viewport
    })
    task.promise.then(function() {
        canvas.toDataURL('image/jpeg')
    });
}

function savePage(id, page){
    var viewport = page.getViewport(5); //http://stackoverflow.com/questions/35400722/pdf-image-quality-is-bad-using-pdf-js
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var task = page.render({
        canvasContext: context,
        viewport: viewport
    })
    task.promise.then(function() {
        var dataurl = canvas.toDataURL('image/png');
        presentationStorage.addSlide(dataurl, id);
    });
}

function addCanvas(keyPage) {
    var canvas = document.createElement('canvas');

    canvas.className = "image-thumbnail";
    canvas.id = keyPage;

    canvas.addEventListener('click', function() {     
        renderPage(keyPage);
        refreshAudioUi();
    }, false);

    $("div.thumbnail-carousel").append(canvas);
    return canvas;
}

function selectFirstPage(){
    renderPage("page-1");
}


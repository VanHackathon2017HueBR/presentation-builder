
var indexCanvas = 1;
var mapPages = new Map();

$(function() {

    PDFJS.disableWorker = true;

    // Asynchronous download PDF as an ArrayBuffer
    var newImgUpload = document.getElementById('new-img');
     newImgUpload.onchange = function(e) {
        uploadImg(e);
    }

    buildPages();
    renderPageCarousel();

});

function retrievePagesSessionStorage(){
    var retrievedObject = sessionStorage.getItem('pages');
    mapPages = new Map(JSON.parse(retrievedObject))
}

function buildPages(){
    var pdfData = sessionStorage.getItem('pdf-file');
    pdfData = pdfData.replace("data:application/pdf;base64,", "")
    PDFJS.getDocument({data: pdfData}).then(function(pdf) {
        if (pdf.numPages) {
            for (var index = 1; index <= pdf.numPages; index++) {
                addPages(pdf, index);
            }
        }
    }, function(error) {
        console.log(error);
    });
}

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

function renderPage(keyPage){
    renderPageSelected(mapPages.get(keyPage));
}

function renderPageSelected(page){
    var scale = 0.6;
    var canvas = document.getElementById("selected-page");
    renderCanvas(canvas, scale, page);
}

/*function renderPageCarousel(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.2;
        var keyPage = nextKeyPage();
        var canvas = addCanvas(keyPage);

        addMapFile(keyPage, page);
        renderCanvas(canvas, scale, page);

        Sortable({
            els: 'canvas.image-thumbnail'
        });
    });
}
*/

function renderPageCarousel() {
    if(mapPages){
      mapPages.forEach(function(page, keyPage){
         var scale = 0.2;
         var keyPage = nextKeyPage();
         var canvas = addCanvas(keyPage);

         renderCanvas(canvas, scale, page);
      });
    }

   Sortable({
        els: 'canvas.image-thumbnail'
    });
}

function nextKeyPage(){
    return "page-" + indexCanvas++;
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

function uploadImg(e){
    var canvas = addCanvas(nextKeyPage());
    var ctx = canvas.getContext('2d');
    var img = new Image;
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 20,20);
        //alert('the image is drawn');
    }
    img.src = URL.createObjectURL(e.target.files[0]);
}


function addCanvas(keyPage) {
    var canvas = document.createElement('canvas');

    canvas.className = "image-thumbnail";
    canvas.id = keyPage;
    
    canvas.addEventListener('click', function() { 
        renderPage(keyPage);
    }, false);

    $("div.thumbnail-carousel").append(canvas);
    return canvas;
}

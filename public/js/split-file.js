
$(function() {

    PDFJS.disableWorker = true;

    // Asynchronous download PDF as an ArrayBuffer
    var pdfUpload = document.getElementById('pdf');
    pdfUpload.onchange = function(event) {
        upload('pdf');
        changePDF(document.getElementById('pdf'));
    }

    var imgUpload = documento.getElementById('new-img');
    imgUpload.onchange = function (event){
        uploadImg(event);
    }

});

var indexCanvas = 1;

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

function renderPage(pageNumber){
    PDFJS.getDocument(fileReader.result).then(function(pdf) {
        renderPageSelected(pdf, pageNumber);
    }, function(error) {
        console.log(error);
    });
}

function renderPageSelected(pdf, pageNumber){
     pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.6;

        var canvas = document.getElementById("selected-page");
        renderCanvas(canvas, scale, page);
    });
}

function renderPageCarousel(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.2;

        var canvas = addCanvas(pageNumber);
        renderCanvas(canvas, scale, page);

        Sortable({
            els: 'canvas.image-thumbnail'
        });
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

function addCanvas(indexPage) {
    var canvas = document.createElement('canvas');
    canvas.className = "image-thumbnail";
    canvas.id = "page-" + indexCanvas++;
    canvas.addEventListener('click', function() {
        renderPage(indexPage);
    }, false);

    $("div.thumbnail-carousel").append(canvas);
    return canvas;
}

PDFJS.disableWorker = true;
//
// Asynchronous download PDF as an ArrayBuffer
//
var pdf = document.getElementById('pdf');
pdf.onchange = function(ev) {
    if (file = document.getElementById('pdf').files[0]) {
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
            PDFJS.getDocument(fileReader.result).then(function(pdf) {
                if (pdf.numPages) {
                    for (var index = 1; index <= pdf.numPages; index++) {
                        renderPage(pdf, index);
                    }
                }
            }, function(error) {
                console.log(error);
            });
        };
        fileReader.readAsArrayBuffer(file);
    }
}

function renderPage(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.2;
        var viewport = page.getViewport(scale);
        //
        // Prepare canvas using PDF page dimensions
        //
        var canvas = addCanvas(pageNumber);
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        //
        // Render PDF page into canvas context
        //
        var task = page.render({
            canvasContext: context,
            viewport: viewport
        })
        task.promise.then(function() {
            canvas.toDataURL('image/jpeg')
                //console.log(canvas.toDataURL('image/jpeg'));
        });

        Sortable({
            els: 'canvas'
        });
    });
}

function addCanvas(index) {
    var canvas = document.createElement('canvas');
    canvas.id = "page-" + index;
    $("div.content").append(canvas);
    return canvas;
}

$(function() {

    PDFJS.disableWorker = true;

    // Asynchronous download PDF as an ArrayBuffer
    var pdfUpload = document.getElementById('new-pdf');
    pdfUpload.onchange = function(ev) {
        upload();
        changePDF(document.getElementById("button-pdf"));
    }

});

var indexCanvas = 1;
var mapPages = new Map();
var pages = [];

function addMapFile(keyPage, page){
    pages.push({key: keyPage,
                value: page})
    //mapPages.set(keyPage, page);
}

function upload(){
    if (file = document.getElementById('new-pdf').files[0]) {
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
            PDFJS.getDocument(fileReader.result).then(function(pdf) {
                sessionStorage.setItem("pdf-file", fileReader.result);
            }, function(error) {
                console.log(error);
            });
        };
        fileReader.readAsDataURL(file);
    }
}

/*
function upload(){
    if (file = document.getElementById('new-pdf').files[0]) {
        fileReader = new FileReader();
        fileReader.onload = function(ev) {
            PDFJS.getDocument(fileReader.result).then(function(pdf) {
                if (pdf.numPages) {
                    for (var index = 1; index <= pdf.numPages; index++) {
                        addPages(pdf, index);
                    }
                }
            }, function(error) {
                console.log(error);
            });
        };
        fileReader.readAsDataURL(file);
    }
}
*/

function addPages(pdf, pageNumber) {
    pdf.getPage(pageNumber).then(function(page) {
        var scale = 0.2;
        var keyPage = nextKeyPage();

        addMapFile(keyPage, page);
        
        var lastPage = pdf.numPages === pageNumber;
        if(lastPage){
            persistPagesSessionStorage();
        }
    });
}


function nextKeyPage(){
    return "page-" + indexCanvas++;
}

function persistPagesSessionStorage(){
    sessionStorage.setItem('pages', JSON.stringify(arrayBuffer2String(pages)));
}

function arrayBuffer2String(buf, callback) {
    var bb = new BlobBuilder();
    bb.append(buf);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result)
    }
    f.readAsText(bb.getBlob());
}

function string2ArrayBuffer(string, callback) {
    var bb = new BlobBuilder();
    bb.append(string);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    }
    f.readAsArrayBuffer(bb.getBlob());
}
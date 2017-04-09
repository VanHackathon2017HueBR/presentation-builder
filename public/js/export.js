function exportPresentation (evt){
    presentationStorage.setInfo($('input#title').val(),tinyMCE.activeEditor.getContent());

    var list = getSlideOrder();

    var zip = new JSZip();
    var manifest = presentationStorage.getManifest("author", list);
    zip.file("manifest.json", JSON.stringify(manifest, null, "\t"));

    for (var i = 0; i < list.length; i++) {
        var slide = presentationStorage.getSlideById(list[i]);
        var image = manifest.slides[i].image;
        var audio = manifest.slides[i].audio;

        zip.file(image, slide.page.substr(slide.page.indexOf(',')+1), {base64: true});

        if(slide.audio){
            zip.file(audio, slide.audio.data);
        }
    }

    zip.generateAsync({type:"blob"})
    .then(function(content) {
        saveAs(content, "awesome.zip");
    });
}

function getSlideOrder(){
    var slides = [];
    $('.thumbnail-carousel').children('.image-thumbnail').each(function () {
        slides.push(this.id);
    });
    return slides;
}
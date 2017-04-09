function exportPresentation (evt){

    var list = getSlideOrder();

    var zip = new JSZip();
    var manifest = presentationStorage.getManifest("author", list);

    for (var i = 0; i < list.length; i++) {
        var slide = presentationStorage.getSlideById(list[i]);
        var image = manifest.slides[i].image;

        zip.file(image, slide.page.substr(slide.page.indexOf(',')+1), {base64: true});

                /*
                if(slide.audio){
            let audio = 'slide' + order + '.ogg';
            zip.file(audio, slide.audio.data);
        }
        */
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
var presentationStorage = (function () {

    /* Objects definition */
    function Presentation (name, description) {
        this.name = name;
        this.description = description;
        this.slides = [];
    }

    function Slide (page, id, audio){
        this.page = page;
        this.id = id;
        this.audio = audio;
    }

    function Audio(data, url, duration){
        this.data = data;
        this.url = url;
        this.duration = duration;
    }

    // Create a new default presentation   
    var presentation = new Presentation("My super cool presentation", "An awsome presentation built from PDF slides");

    /* Functions to be exported */
    var addSlide = function (page, id, index){
        var slide = new Slide(page, id, null);
        if(index){
            presentation.slides[index] = slide;
        }
        else{
            presentation.slides.push(slide);
        }
    }

    var getSlide = function (index){
        return presentation.slides[index].page;
    }

    var deleteSlide = function (index){
        presentation.slides.splice(index, index+1);
    }

    var getSlideById = function (id){
        return presentation.slides.filter(function( slide ){
            return slide.id == id;
        })[0];
    }

    var moveSlides = function (from, to){
        if(from < 0 || from >= presentation.slides.length || to < 0 || to >= presentation.slides.length)
            return;
        presentation.slides.splice(to, 0, presentation.slides.splice(from, 1)[0]);
        return presentation.slides;
    }

    var setSlideAudio = function (id, data, url, duration){
        getSlideById(id).audio = new Audio(data, url, duration);
    }

    var getSlideAudio = function (index){
        return presentation.slides[index].audio;
    }

    var clearPresentation = function (){
        presentation.slides = [];
    }

    /* Presentation data */
    var getSize = function (){
        return presentation.slides.length;
    }

    var getName = function (){
        return presentation.name;
    }

    var getDescription = function (){
        return presentation.description;
    }

    var setInfo = function (name, description){
        presentation.name = name;
        presentation.description = description;
    }

    var getManifest = function(author, list){
        let manifest = {
            "author": author,
            "date": new Date(),
            "name": presentation.name,
            "description": presentation.description
        }
        manifest.slides = [];

        for (let i = 0; i < presentation.slides.length; i++) {
            let slide = {};
            let order = i+1;
            slide.position = order;
            slide.image = 'slide' + order + '.png';
            if(getSlideById(list[i]).audio){
                slide.audio = 'slide' + order + '.ogg';
                slide.audioLength = getSlideById(list[i]).audio.duration;
            }
            manifest.slides.push(slide);
        }

        return manifest;
    }

    // Return an object exposed to the public
    return {
        setInfo:            setInfo,
        addSlide:           addSlide,
        getSlide:           getSlide,
        getSlideById:       getSlideById,
        deleteSlide:        deleteSlide,
        moveSlides:         moveSlides,
        setSlideAudio:      setSlideAudio,
        getSlideAudio:      getSlideAudio,
        clearPresentation:  clearPresentation,
        getManifest:        getManifest,
        size:               getSize,
        name:               getName,
        description:        getDescription
    };
})();

// Add support to be exported as a module
if (typeof module !== 'undefined' && module.exports != null) {
    module.exports = presentationStorage;
}
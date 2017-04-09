var presentationStorage = (function () {

    function Presentation (name, description) {
        this.name = name;
        this.description = description;
        this.slides = [];
    }

    function Slide (page, audio){
        this.page = page;
        this.audio = audio;
    }

    Slide.prototype.getAudio = function(){
        return this.audio;
    }

    Slide.prototype.setAudio = function(audio){
        this.audio = audio;
    }

    function Audio(data, duration){
        this.data = data;
        this.duration = duration;
    }

    var presentation = new Presentation("My super cool presentation", "An awsome presentation built from PDF slides");

    var setInfo = function (name, description){
        presentation.name = name;
        presentation.description = description;
    }

    var addSlide = function (page){
        var slide = new Slide(page);
        this.slides.push(slide);
    }

    var getSlide = function (index){
        return this.slides.page;
    }

    var deleteSlide = function (index){
        this.slides.slice(index, index+1);
    }

    var moveSlides = function (from, to){
        this.slides.splice(to, 0, this.slides.splice(from, 1)[0]);
        return this.slides;
    }

    var setSlideAudio = function (index, data, duration){
        this.slides[index].audio = new Audio(data, duration);
    }

    var getSlideAudio = function (index, data){
        return this.slides[index].audio;
    }

    var clearPresentation = function (){
        this.slides = [];
    }

    var getSize = function (){
        return this.slides.length;
    }
    
    // Return an object exposed to the public
    return {
        setInfo:      setInfo,
        addSlide:       addSlide,
        getSlide:       getSlide,
        deleteSlide: deleteSlide,
        moveSlides:   moveSlides,
        setSlideAudio:    setSlideAudio,
        getSlideAudio:       getSlideAudio,
        clearPresentation: clearPresentation,
        size:   getSize,
    };
})();

if (typeof module !== 'undefined' && module.exports != null) {
    module.exports = presentationStorage;
}
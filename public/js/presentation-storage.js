var presentationStorage = (function () {

    /* Objects definition */
    function Presentation (name, description) {
        this.name = name;
        this.description = description;
        this.slides = [];
    }

    function Slide (page, audio){
        this.page = page;
        this.audio = audio;
    }

    function Audio(data, duration){
        this.data = data;
        this.duration = duration;
    }
    
    // Create a new default presentation   
    var presentation = new Presentation("My super cool presentation", "An awsome presentation built from PDF slides");

    /* Functions to be exported */
    var addSlide = function (page){
        var slide = new Slide(page, null);
        presentation.slides.push(slide);
    }

    var getSlide = function (index){
        return presentation.slides[index].page;
    }

    var deleteSlide = function (index){
        presentation.slides.splice(index, index+1);
    }

    var moveSlides = function (from, to){
        if(from < 0 || from >= presentation.slides.length || to < 0 || to >= presentation.slides.length)
            return;
        presentation.slides.splice(to, 0, presentation.slides.splice(from, 1)[0]);
        return presentation.slides;
    }

    var setSlideAudio = function (index, data, duration){
        presentation.slides[index].audio = new Audio(data, duration);
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
    
    // Return an object exposed to the public
    return {
        setInfo:            setInfo,
        addSlide:           addSlide,
        getSlide:           getSlide,
        deleteSlide:        deleteSlide,
        moveSlides:         moveSlides,
        setSlideAudio:      setSlideAudio,
        getSlideAudio:      getSlideAudio,
        clearPresentation:  clearPresentation,
        size:               getSize,
        name:               getName,
        description:        getDescription
    };
})();

// Add support to be exported as a module
if (typeof module !== 'undefined' && module.exports != null) {
    module.exports = presentationStorage;
}
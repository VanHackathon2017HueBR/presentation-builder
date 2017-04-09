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


    /* Functions to be exported */
    var addSlide = function (page){
        var slide = new Slide(page, null);
        this.slides.push(slide);
    }

    var getSlide = function (index){
        return this.slides[index].page;
    }

    var deleteSlide = function (index){
        this.slides.splice(index, index+1);
    }

    var moveSlides = function (from, to){
        if(from < 0 || from >= this.slides.length || to < 0 || to >= this.slides.length)
            return;
        this.slides.splice(to, 0, this.slides.splice(from, 1)[0]);
        return this.slides;
    }

    var setSlideAudio = function (index, data, duration){
        this.slides[index].audio = new Audio(data, duration);
    }

    var getSlideAudio = function (index){
        return this.slides[index].audio;
    }

    var clearPresentation = function (){
        this.slides = [];
    }

    /* Presentation data */
    var getSize = function (){
        return this.slides.length;
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

    // Create a new default presentation   
    var presentation = new Presentation("My super cool presentation", "An awsome presentation built from PDF slides");
    
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
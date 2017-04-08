var presentationStorage = (function () {

    function Presentation (name, description) {
        this.name = name;
        this.description = description;
        this.slides = [];
    }

    function Slide (img, audio){
        this.img = img;
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

    function setInfo(name, description){
        presentation.name = name;
        presentation.description = description;
    }

    function addSlide(canvas){
        var slide = new Slide(canvas);
        this.slides.push(slide);
    }

    function getSlideCanvas(index){
        return this.slides.canvas;
    }

    function moveSlides(from, to){
        this.slides.splice(to, 0, this.slides.splice(from, 1)[0]);
        return this.slides;
    }

    function setSlideAudio(index, data, duration){
        this.slides[index].audio = new Audio(data, duration);
    }

    function getSlideAudio(index, data){
        return this.slides[index].audio;
    }
    
    // Return an object exposed to the public
    return {
        setInfo:      setInfo,
        addSlide:       addSlide,
        getSlideCanvas:       getSlideCanvas,
        moveSlides:   moveSlides,
        setSlideAudio:    setSlideAudio,
        getSlideAudio:       getSlideAudio,
        size:   this.slides.lenght
    };
})();
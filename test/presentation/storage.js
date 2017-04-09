//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let should = chai.should();

var ps = require('../../public/js/presentation-storage');


describe('presentation creation', () => {
    beforeEach((done) => {
        ps.clearPresentation();
        done();
    });

    it('should start with an empty presentation', (done) => {
        ps.size().should.equal(0);
        done();
    });

    it('should be able to change title and description', (done) => {
        let name = "presentation title";
        let desc = "my awsome description!";
        ps.setInfo(name, desc);

        ps.name().should.equal(name);
        ps.description().should.equal(desc);
        done();
    });

    it('should be able to add pages', (done) => {
        let page = 'this is supposed to be a page';
        let page2 = 'page number 2';
        ps.addSlide(page);
        ps.addSlide(page2);

        ps.size().should.equal(2);
        ps.getSlide(0).should.equal(page);
        ps.getSlide(1).should.equal(page2);

        done();
    });

    it('should be able to add audio to slides', (done) => {
        let page = 'this is supposed to be a page';
        ps.addSlide(page);

        let audio = {data: 'audio data...', duration: 34};
        ps.setSlideAudio(0, audio.data, audio.duration);

        ps.getSlideAudio(0).should.deep.equal(audio);
        done();
    });

    it('should be able to delete pages', (done) => {
        let page = 'this is supposed to be a page';
        let page2 = 'page number 2';
        ps.addSlide(page);
        ps.addSlide(page2);

        ps.deleteSlide(0);

        ps.size().should.equal(1);
        ps.getSlide(0).should.equal(page2);
        done();
    });

    it('should be able to change slides order', (done) => {
        let page = 'this is supposed to be a page';
        let page2 = 'page number 2';
        let page3 = 'just another page';
        let page4 = 'just one more and we are done for now';
        ps.addSlide(page);
        ps.addSlide(page2);
        ps.addSlide(page3);
        ps.addSlide(page4);

        // Send element on position 1 to 3
        ps.moveSlides(1, 3);

        ps.getSlide(0).should.equal(page);
        ps.getSlide(1).should.equal(page3);
        ps.getSlide(2).should.equal(page4);
        ps.getSlide(3).should.equal(page2);

        // dont change positions
        ps.moveSlides(0, 6);
        ps.getSlide(0).should.equal(page);
        ps.getSlide(1).should.equal(page3);
        ps.getSlide(2).should.equal(page4);
        ps.getSlide(3).should.equal(page2);

        // dont change positions
        ps.moveSlides(1, -1);
        ps.getSlide(0).should.equal(page);
        ps.getSlide(1).should.equal(page3);
        ps.getSlide(2).should.equal(page4);
        ps.getSlide(3).should.equal(page2);


        // send element 2 to first position 
        ps.moveSlides(2, 0);
        ps.getSlide(0).should.equal(page4);
        ps.getSlide(1).should.equal(page);
        ps.getSlide(2).should.equal(page3);
        ps.getSlide(3).should.equal(page2);

        done();
    });
    
});
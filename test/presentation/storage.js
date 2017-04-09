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
});
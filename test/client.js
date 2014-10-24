var config = require('./config');
var Helpers = require('./helpers');
var PulsarApi = require('../src');
var PulsarServerJob = require('../node_modules/pulsar-rest-api/lib/pulsar/job');

var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

describe('tests of pulsar API', function() {

  this.timeout(4000);

  it('Single instance', function(done) {
    Helpers.createServer(config.single);
    var pulsarApi = new PulsarApi(config.single);
    var job = pulsarApi.createJob('app', 'env', 'task');


    var createSpy = sinon.spy(function() {
      job.data.status.should.equal(PulsarServerJob.STATUS.CREATED);
    });
    job.on('create', createSpy);


    var changeSpy = sinon.spy(function() {
      createSpy.should.have.been.calledOnce;
      //job.data.status.should.equal(PulsarServerJob.STATUS.RUNNING);
    });
    job.on('change', changeSpy);

    job.on('finish', function() {
      changeSpy.should.have.been.called;
      job.data.status.should.equal(PulsarServerJob.STATUS.FINISHED);
      job.data.id.should.be.above(0);
      done();
    });

    pulsarApi.runJob(job);
  });

});

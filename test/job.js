var assert = require("chai").assert;
var Job = require('../src/job');
var PulsarServerJob = require('pulsar-rest-api/lib/pulsar/job');

describe('Job tests', function() {

  var job;

  beforeEach(function() {
    job = new Job('app', 'env', 'task');
  });

  it('setData to .data', function() {
    var data = {foo: 'bar'};
    job.setData(data);
    assert.deepEqual(job.data, data);
  });

  it('isRunning works', function() {
    assert.isFalse(job.isRunning());
    job.setData({status: PulsarServerJob.STATUS.RUNNING});
    assert.isTrue(job.isRunning());
  });

  it('isCreated works', function() {
    assert.isFalse(job.isCreated());
    job.setData({status: PulsarServerJob.STATUS.CREATED});
    assert.isTrue(job.isCreated());
  });

  it('toString works', function() {
    var data = {id: 'id'};
    job.setData(data);
    var serializedJob = job + '';
    assert.include(serializedJob, job.app);
    assert.include(serializedJob, job.env);
    assert.include(serializedJob, job.task);
    assert.include(serializedJob, data.id);
  });

});

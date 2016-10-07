var _ = require('underscore');
var Promise = require('bluebird');
var assert = require("chai").assert;
var sinon = require("sinon");
var Client = require('../src/client');
var Job = require('../src/job');

describe('Client tests', function() {

  context('runJob', function() {

    it('resolves if response contains job.id', function() {
      var job = new Job('app', 'env', 'task');
      var client = new Client('', '');

      sinon.stub(client._rest, 'request', function(url, options) {
        assert.equal(url, '/app/env');
        assert.include(options.body, {task: 'task'});
        return Promise.resolve({id: 'id'});
      });

      return client.runJob(job);
    });

    it('rejects if response does not contain job.id', function() {
      var job = new Job('app', 'env', 'task');
      var client = new Client('', '');

      sinon.stub(client._rest, 'request', function() {
        return Promise.resolve({});
      });

      return client.runJob(job)
        .then(
          function() {
            throw new Error('client.runJob must fail in this test');
          },
          function(error) {
            assert.include(error.message, ' id');
          }
        );
    });

  });

  context('killJob', function() {

    it('resolves if job contains data.id', function() {
      var job = new Job('app', 'env', 'task');
      job.data.id = 'id-1';
      var client = new Client('', '');

      sinon.stub(client._rest, 'request', function(url, options) {
        assert.equal(url, '/job/id-1/kill');
        return Promise.resolve();
      });

      return client.killJob(job);
    });

    it('rejects if job does not contain data.id', function() {
      var job = new Job('app', 'env', 'task');
      var client = new Client('', '');

      return client.killJob(job)
        .then(
          function() {
            throw new Error('client.killJob must fail in this test');
          },
          function(error) {
            assert.equal(error.message + '', 'Invalid job');
          }
        );
    });

  });

  context('jobs', function() {
    it('it directly returns response from url', function() {
      var client = new Client('', '');

      sinon.stub(client._rest, 'request', function(url) {
        assert.equal(url, '/jobs');
        return Promise.resolve('jobs');
      });

      return client.jobs().then(function(jobs) {
        assert.equal(jobs, 'jobs');
      });
    });
  });


});

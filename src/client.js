var _ = require('underscore');
var Promise = require('bluebird');
var Rest = require('./rest');
var Websocket = require('./websocket');

/**
 * @param {String} url
 * @param {String} token
 * @constructor
 */
function Client(url, token) {
  this._rest = new Rest(url, token);
  this._websocket = new Websocket(url, token);
}

/**
 * @returns {Promise}
 */
Client.prototype.connect = function() {
  return this._websocket.connect();
};

/**
 * @param {Job} job
 * @return {Promise}
 */
Client.prototype.runJob = function(job) {
  var postData = {task: job.task};
  if (job.taskVariables && !_.isEmpty(job.taskVariables)) {
    postData.taskVariables = job.taskVariables;
  }
  return this._rest.request("/" + job.app + "/" + job.env, {
      method: 'POST',
      body: postData,
      json: true
    })
    .then(function(jobData) {
      if (jobData.id) {
        job.setData(jobData);
        this._websocket.addJob(job);
        job.emit('create');
        return job;
      } else {
        var error = new Error('Got empty job id. Job was not created.');
        job.emit('error', error);
        throw error;
      }
    }.bind(this))
    .catch(function(error) {
      job.emit('error', error);
      throw error;
    });
};

/**
 *
 * @param {Job} job
 * @returns {Promise}
 */
Client.prototype.killJob = function(job) {
  if (!job || !job.data || !job.data.id) {
    return Promise.reject(new Error('Invalid job'));
  }
  return this._rest.request("/job/" + job.data.id + "/kill", {
    method: 'POST'
  });
};

Client.prototype.jobs = function() {
  return this._rest.request('/jobs');
};

module.exports = Client;

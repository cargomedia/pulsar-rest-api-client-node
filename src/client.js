var _ = require('underscore');
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
 */
Client.prototype.runJob = function(job) {
  var postData = {task: job.task};
  if (job.taskVariables && !_.isEmpty(job.taskVariables)) {
    postData.taskVariables = job.taskVariables;
  }
  this._rest.request("/" + job.app + "/" + job.env, {
      method: 'POST',
      body: postData,
      json: true
    })
    .then(function(jobData) {
      if (jobData.id) {
        job.setData(jobData);
        this._websocket.addJob(job);
        return job.emit('create');
      } else {
        return job.emit('error', 'Got empty job id. Job was not created.');
      }
    }.bind(this))
    .catch(function(error) {
      return job.emit('error', error);
    });
};

/**
 * @returns {Promise}
 */
Client.prototype.jobs = function() {
  return this._rest.request('/jobs');
};

module.exports = Client;

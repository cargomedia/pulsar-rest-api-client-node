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
 * @param {Job} job
 */
Client.prototype.runJob = function(job) {
  var postData = {task: job.task};
  if (job.taskVariables && !_.isEmpty(job.taskVariables)) {
    postData.taskVariables = job.taskVariables;
  }
  this._rest.post("/" + job.app + "/" + job.env, {
    data: JSON.stringify(postData),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .on('complete', function(jobData) {
      if (jobData.id) {
        job.setData(jobData);
        this._websocket.addJob(job);
        return job.emit('create');
      } else {
        return job.emit('error', 'Got empty job id. Job was not created.');
      }
    }.bind(this))
    .on('error', function(error) {
      return job.emit('error', error);
    })
    .on('fail', function(error) {
      return job.emit('error', error);
    });
};

Client.prototype.jobs = function(callback) {
  return this._rest.get('/jobs').on('complete', function(jobs) {
    return callback(jobs);
  });
};

module.exports = Client;

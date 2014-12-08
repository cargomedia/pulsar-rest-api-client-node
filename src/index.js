var _ = require('underscore');
var async = require('async');
var Config = require('./config');
var Client = require('./client');
var Job = require('./job');

/**
 * @param {Object} configData @see Config.
 */
function PulsarApi(configData) {
  var config = new Config(configData);
  this._clientDefault = new Client(config.url, config.authToken);

  this._clientMap = {};
  _.each(config.auxiliary, function(clientConfig, key) {
    return this._clientMap[key] = new Client(clientConfig.url, clientConfig.authToken);
  }.bind(this));
}

PulsarApi.prototype.getClientDefault = function() {
  return this._clientDefault;
};

PulsarApi.prototype.getClient = function(app, env) {
  var name = this._getClientName(app, env);
  if (this._clientMap[name]) {
    return this._clientMap[name];
  } else {
    return this.getClientDefault();
  }
};

PulsarApi.prototype.createJob = function(app, env, task, taskVariables) {
  return new Job(app, env, task, taskVariables);
};

PulsarApi.prototype.runJob = function(job) {
  var client = this.getClient(job.app, job.env);
  client.runJob(job);
};

PulsarApi.prototype.jobs = function(callback) {
  var clientList = _.toArray(this._clientMap);
  clientList.unshift(this._clientDefault);

  var getClientJobs = function(client, callback) {
    return client.jobs(callback);
  };

  return async.map(clientList, getClientJobs, function(results) {
    var concatenator = function(all, items) {
      return all.concat(items);
    };
    var jobs = _.reduce(results, concatenator, []);
    return callback(jobs);
  });
};

PulsarApi.prototype._getClientName = function(app, env) {
  var name = '';
  if (app) {
    name += app;
  }
  if (env) {
    name += '/' + env;
  }
  return name;
};

module.exports = PulsarApi;

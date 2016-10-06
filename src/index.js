var _ = require('underscore');
var Promise = require('bluebird');
var Config = require('./config');
var Client = require('./client');
var Job = require('./job');

/**
 * @param {Object} configData @see Config.
 */
function PulsarApi(configData) {
  var config = new Config(configData);
  this._clientDefault = new Client(config.url, config.authToken);
  this._clientDefault.connect();

  this._clientMap = {};
  _.each(config.auxiliary, function(clientConfig, key) {
    var client = new Client(clientConfig.url, clientConfig.authToken);
    client.connect();
    this._clientMap[key] = client;
    return client;
  }.bind(this));
}

/**
 * @returns {Client}
 */
PulsarApi.prototype.getClientDefault = function() {
  return this._clientDefault;
};

/**
 * @param {String} app
 * @param {String} env
 * @returns {Client}
 */
PulsarApi.prototype.getClient = function(app, env) {
  var name = this._getClientName(app, env);
  if (this._clientMap[name]) {
    return this._clientMap[name];
  } else {
    return this.getClientDefault();
  }
};

/**
 * @param {String} app
 * @param {String} env
 * @param {String} task
 * @param {Object} taskVariables
 * @returns {Job}
 */
PulsarApi.prototype.createJob = function(app, env, task, taskVariables) {
  return new Job(app, env, task, taskVariables);
};

/**
 * @param {Job} job
 */
PulsarApi.prototype.runJob = function(job) {
  var client = this.getClient(job.app, job.env);
  client.runJob(job);
};

/**
 * @return {Promise}
 */
PulsarApi.prototype.jobs = function() {
  var clientList = _.toArray(this._clientMap);
  clientList.unshift(this._clientDefault);

  return Promise.map(clientList, function(client) {
    return client.jobs();
  }).then(function(listOfJobList) {
    return _.reduce(listOfJobList, function(all, items) {
      return all.concat(items);
    }, []);
  });
};

/**
 * @param {String} app
 * @param {String} env
 * @returns {string}
 * @private
 */
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

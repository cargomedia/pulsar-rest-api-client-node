var util = require('util');
var _ = require('underscore');
var EventEmitter = require('events').EventEmitter;

function Job(app, env, task) {
  this.app = app;
  this.env = env;
  this.task = task;
  this.data = {};

  EventEmitter.call(this);
}

util.inherits(Job, EventEmitter);

Job.prototype.setData = function(jobData) {
  return _.extend(this.data, jobData);
};

Job.prototype.toString = function() {
  var result = util.format('%s "%s" to "%s"', this.task, this.app, this.env);
  if (this.data.id) {
    result += ' id: ' + this.data.id;
  }
  return result;
};

module.exports = Job;

/**
 * Created by vogdb on 17/10/14.
 */
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var sockjs = require('sockjs');
var http = require('http');
var Chance = require('chance');
var chance = new Chance();
var PulsarJob = require('../node_modules/pulsar-rest-api/lib/pulsar/job');

function ServerMock(port) {
  var app = express();
  var router = express.Router();
  app.use(router);
  var server = http.createServer(app);
  var jobList = {};
  var websocket = new WebsocketMock(server);

  function addJob(job) {
    jobList[job.id] = job;
    websocket.addJob(job);
  }

  router.post('/:app/:env', function(req, res) {
    var job = new PulsarJobMock();
    addJob(job);
    res.send(job.getData());
  });

  router.get('/jobs', function(req, res) {
    res.send(JSON.stringify(jobList));
  });

  server.listen(port);
}

function WebsocketMock(server) {
  var sockjsServer = sockjs.createServer();
  this.connectionList = [];
  var self = this;
  sockjsServer.on('connection', function(connection) {
    self.connectionList.push(connection);
    connection.on('close', function() {
      delete self.connectionList[connection];
    });
  });
  sockjsServer.installHandlers(server, {prefix: '/websocket'});
}

WebsocketMock.prototype.addJob = function(job) {
  job.on('change', this.emitChange.bind(this, job));
};

WebsocketMock.prototype.emitChange = function(job) {
  for (var i = this.connectionList.length - 1; i >= 0; i--) {
    this.connectionList[i].write(JSON.stringify({
      event: 'job.change',
      job: job
    }));
  }
};

function PulsarJobMock() {
  this.id = chance.natural();
  this.status = PulsarJob.STATUS.CREATED;
  this.output = '';

  var self = this;
  setTimeout(function() {
    self.status = PulsarJob.STATUS.RUNNING;
    self.output += chance.sentence();
    self.emit('change');
  }, 1000);
  setTimeout(function() {
    self.status = PulsarJob.STATUS.FINISHED;
    self.output += chance.sentence();
    self.emit('change');
  }, 2000);
  EventEmitter.call(this);
}

util.inherits(PulsarJobMock, EventEmitter);

PulsarJobMock.prototype.getData = function() {
  return _.pick(this, 'id', 'status', 'output');
};

module.exports = ServerMock;

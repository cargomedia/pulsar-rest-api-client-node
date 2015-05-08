/**
 * Created by vogdb on 17/10/14.
 */
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var bodyParser = require('body-parser');
var sockjs = require('sockjs');
var http = require('http');
var Chance = require('chance');
var chance = new Chance();
var PulsarJob = require('../node_modules/pulsar-rest-api/lib/pulsar/job');

function ServerMock(port) {
  var app = express();
  var router = express.Router();
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(router);
  var server = http.createServer(app);
  var jobList = {};
  var websocket = new WebsocketMock(server);

  var openSockets = [];
  server.on('connection', function(socket) {
    openSockets.push(socket);
  });

  function addJob(job) {
    jobList[job.id] = job;
    websocket.addJob(job);
  }

  router.post('/:app/:env', function(req, res) {
    this.emit('job.create', {req: req, res: res});
    var job = new PulsarJobMock();
    addJob(job);
    res.send(job.getData());
  }.bind(this));

  router.get('/jobs', function(req, res) {
    res.send(JSON.stringify(jobList));
  });

  server.listen(port);
  this.serverHttp = server;
  this.serverWebsocket = websocket;
  this.openSockets = openSockets;
}

util.inherits(ServerMock, EventEmitter);

/**
 * @returns {WebsocketMock}
 */
ServerMock.prototype.getWebsocketServer = function() {
  return this.serverWebsocket;
};

/**
 * @param {Function} callback
 * @returns {WebsocketMock}
 */
ServerMock.prototype.close = function(callback) {
  this.serverHttp.close(callback);
  _.each(this.openSockets, function(socket) {
    socket.destroy();
  });
};

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
  job.on('change', this.emit.bind(this, job, 'job.change'));
  job.on('close', this.emit.bind(this, job, 'job.close'));
};

WebsocketMock.prototype.emit = function(job, event) {
  for (var i = this.connectionList.length - 1; i >= 0; i--) {
    this.connectionList[i].write(JSON.stringify({
      event: event,
      job: job
    }));
  }
};

WebsocketMock.prototype.disconnectAllClients = function() {
  this.connectionList.forEach(function(connection) {
    connection.end();
  });
};

function PulsarJobMock() {
  this.id = chance.natural();
  this.status = PulsarJob.STATUS.CREATED;
  this.stdout = '';
  this.output = '';

  var self = this;
  setTimeout(function() {
    self.status = PulsarJob.STATUS.RUNNING;
    self.stdout += chance.sentence();
    self.output = self.stdout;
    self.emit('change');
  }, 1000);
  setTimeout(function() {
    self.stdout += chance.sentence();
    self.output = self.stdout;
    self.emit('change');
    self.status = PulsarJob.STATUS.FINISHED;
    self.emit('close');
  }, 2000);
  EventEmitter.call(this);
}

util.inherits(PulsarJobMock, EventEmitter);

PulsarJobMock.prototype.getData = function() {
  return _.pick(this, 'id', 'status', 'stdout', 'output');
};

module.exports = ServerMock;

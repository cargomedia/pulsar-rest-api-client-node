var SockJS = require('node-sockjs-client');

function Websocket(apiUrl, apiAuthToken) {
  this._jobList = {};
  this._jobOutputList = {};
  this.connect(apiUrl + '/websocket', apiAuthToken);
}

Websocket.prototype.connect = function(url, authToken) {
  var sock = new SockJS(url);
  if (authToken) {
    sock.onopen = function() {
      return sock.send(JSON.stringify({
        token: authToken
      }));
    };
  }

  sock.onmessage = function(msg) {
    var data = JSON.parse(msg.data);
    if (data.event === 'job.change') {
      return this.updateJob(data.job);
    }
  }.bind(this);
};

Websocket.prototype.updateJob = function(jobData) {
  var job = this._jobList[jobData.id];
  if (!job) {
    return;
  }
  job.setData(jobData);
  this.emitChange(job);
  if (jobData.status !== 'RUNNING') {
    return this.finishJob(job);
  }
};

Websocket.prototype.emitChange = function(job) {
  var lastSentPosition = this._jobOutputList[job.data.id] || 0;
  job.emit('change', job.data.output.substring(lastSentPosition));
  return this._jobOutputList[job.data.id] = job.data.output.length - 1;
};

Websocket.prototype.finishJob = function(job) {
  delete this._jobList[job.data.id];
  delete this._jobOutputList[job.data.id];
  return job.emit('finish');
};

Websocket.prototype.addJob = function(job) {
  return this._jobList[job.data.id] = job;
};

module.exports = Websocket;

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
    if (this._isJobEvent(data.event)) {
      var jobData = data.job;
      var job = this._jobList[jobData.id];
      if (!job) {
        return;
      }
      job.setData(jobData);

      if (data.event === 'job.change') {
        this.updateJob(job);
      } else if (data.event === 'job.close') {
        this.closeJob(job);
      }
    }
  }.bind(this);
};

Websocket.prototype._isJobEvent = function(event) {
  return event.indexOf('job.') === 0;
};

Websocket.prototype.updateJob = function(job) {
  var lastSentPosition = this._jobOutputList[job.data.id] || 0;
  job.emit('change', job.data.output.substring(lastSentPosition));
  this._jobOutputList[job.data.id] = job.data.output.length - 1;
};

Websocket.prototype.closeJob = function(job) {
  delete this._jobList[job.data.id];
  delete this._jobOutputList[job.data.id];
  job.emit('close');
};

Websocket.prototype.addJob = function(job) {
  this._jobList[job.data.id] = job;
};

module.exports = Websocket;

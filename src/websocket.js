var SockJS = require('node-sockjs-client');

function Websocket(apiUrl, apiAuthToken) {
  this._jobList = {};
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

      switch (data.event) {
        case 'job.change':
          this.updateJob(job);
          break;
        case 'job.close':
          this.closeJob(job);
          break;
      }
    }
  }.bind(this);
};

Websocket.prototype._isJobEvent = function(event) {
  return event.indexOf('job.') === 0;
};

Websocket.prototype.updateJob = function(job) {
  job.emit('change');
};

Websocket.prototype.closeJob = function(job) {
  delete this._jobList[job.data.id];
  job.emit('close');
};

Websocket.prototype.addJob = function(job) {
  this._jobList[job.data.id] = job;
};

module.exports = Websocket;

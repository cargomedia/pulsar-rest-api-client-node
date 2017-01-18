var SockJS = require('sockjs-client');

function Websocket(apiUrl, authToken) {
  this._jobList = {};
  this._url = apiUrl + '/websocket';
  this._authToken = authToken;
}

/**
 * @return {Promise}
 */
Websocket.prototype.connect = function() {
  var url = this._url;
  var authToken = this._authToken;
  var sock = new SockJS(url);

  sock.onopen = function() {
    if (authToken) {
      sock.send(JSON.stringify({
        token: authToken
      }));
    }
  };

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

  sock.onclose = function(error) {
    this.connect();
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
  if ('FINISHED' === job.data.status) {
    job.emit('success');
  } else {
    job.emit('error', 'Job finished with status `' + job.data.status + '`.');
  }
};

Websocket.prototype.addJob = function(job) {
  this._jobList[job.data.id] = job;
};

module.exports = Websocket;

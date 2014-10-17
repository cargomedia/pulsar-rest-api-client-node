var ServerMock = require('./server-mock');

function Helpers() {
}

Helpers.getConfigPort = function(url) {
  var portRegex = /http:\/\/[\w\.]+:(\d{4,6}).*/ig;
  var portMatch = portRegex.exec(url);
  return portMatch[1];
};

Helpers.createServer = function(config) {
  return new ServerMock(Helpers.getConfigPort(config.url));
};

module.exports = Helpers;

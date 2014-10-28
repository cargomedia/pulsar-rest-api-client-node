var util = require('util');
var RestlerService = require('restler').Service;

function Rest(url, token) {
  var defaults = {};
  defaults.baseURL = url;
  if (token) {
    defaults.username = token;
    defaults.password = 'x-oauth-basic';
  }
  RestlerService.call(this, defaults);
}

util.inherits(Rest, RestlerService);

module.exports = Rest;

var util = require('util');
var requestPromise = require('request-promise');

function Rest(url, token) {
  this._url = url;
  if (token) {
    this._token = token;
  }
}

/**
 * @param {String} url
 * @param {Object} options
 * @returns {Promise}
 */
Rest.prototype.request = function(url, options) {
  var permanentOptions = {
    uri: this._url + url
  };
  if (this._token) {
    permanentOptions['auth'] = {
      user: this._token,
      pass: 'x-oauth-basic',
      sendImmediately: true
    };
  }
  return requestPromise(Object.assign({}, options, permanentOptions));
};

module.exports = Rest;

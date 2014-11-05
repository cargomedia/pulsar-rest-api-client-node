var _ = require('underscore');
var fs = require('fs');

/**
 * @param {String|Object} filePath. If param is a String then it is treated as a file path to a config file.
 * If param is an Object then it is treated as a parsed config file.
 * @constructor
 */
function Config(filePath) {
  var data;
  if (_.isObject(filePath)) {
    data = filePath;
  } else {
    data = this.parse(filePath);
  }
  this.validate(data);
  return Object.freeze(data);
}

Config.prototype.parse = function(filePath) {
  var content = fs.readFileSync(filePath, {
    encoding: 'utf8'
  });
  return JSON.parse(content);
};

Config.prototype.validate = function(data) {
  this._validateApiInstance(data);
  return _.each(data.auxiliary, function(api, apiName) {
    if (!/^\w+\/\w*$/i.test(apiName)) {
      throw new Error("Wrong pulsarApi auxiliary API name: '" + apiName + "'. The acceptable format is: [{application}/{environment}].");
    }
    return this._validateApiInstance(api, apiName);
  }.bind(this));
};

Config.prototype._validateApiInstance = function(api, apiName) {
  if (!api.url) {
    throw new Error("Define `" + apiName + ".url` in the config");
  }
};

module.exports = Config;

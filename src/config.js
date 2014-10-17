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
  var pulsarApi = data.pulsarApi;
  if (!pulsarApi) {
    throw new Error('Define `pulsarApi` config options');
  }
  this.validatePulsarApiInstance(pulsarApi, 'pulsarApi');
  return _.each(pulsarApi.auxiliary, (function(_this) {
    return function(api, apiName) {
      if (!/^\w+\/\w+$/i.test(apiName)) {
        throw new Error("Wrong pulsarApi auxiliary API name: '" + apiName + "'. The acceptable format is: [{application}/{environment}].");
      }
      return _this.validatePulsarApiInstance(api, apiName);
    };
  })(this));
};

Config.prototype.validatePulsarApiInstance = function(api, apiName) {
  if (!api.url) {
    throw new Error("Define `" + apiName + ".url` in the config");
  }
};

module.exports = Config;

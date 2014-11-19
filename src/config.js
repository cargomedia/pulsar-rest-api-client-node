var _ = require('underscore');

/**
 * @param {Object} data.
 * @constructor
 */
function Config(data) {
  this.validate(data);
  return Object.freeze(data);
}

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

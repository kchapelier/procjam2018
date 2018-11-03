"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NoParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {};
}

extendClass(NoParameters, BaseParameters);

NoParameters.prototype.initializeElements = function () {
  // ...
};

module.exports = NoParameters;
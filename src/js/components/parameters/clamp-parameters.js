"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ClampParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    minimum: getProp(values, 'minimum', 0),
    maximum: getProp(values, 'maximum', 1)
  };
}

extendClass(ClampParameters, BaseParameters);

ClampParameters.prototype.initializeElements = function () {
  this.setElement('minimum', 'range', 'Minimum', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('maximum', 'range', 'Maximum', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = ClampParameters;
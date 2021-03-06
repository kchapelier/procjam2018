"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function WarpParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    intensity: getProp(values, 'intensity', 0)
  };
}

extendClass(WarpParameters, BaseParameters);

WarpParameters.prototype.initializeElements = function () {
  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });
};

module.exports = WarpParameters;
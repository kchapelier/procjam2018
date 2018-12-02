"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    intensity: getProp(values, 'intensity', 2),
    iterations: 65.,
    parabolaFactor: getProp(values, 'parabolaFactor', 3)
  };
}

extendClass(NormalBlurParameters, BaseParameters);

NormalBlurParameters.prototype.initializeElements = function () {
  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 10,
    hardMin: 0,
    hardMax: 50
  });

  this.setElement('parabolaFactor', 'range', 'Parabola factor', {
    softMin: 0.1,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });
};

module.exports = NormalBlurParameters;
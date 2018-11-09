"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function DirectionalBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 1),
    intensity: getProp(values, 'intensity', 3),
    iterations: 200.,
    parabolaFactor: 3.
  };
}

extendClass(DirectionalBlurParameters, BaseParameters);

DirectionalBlurParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'angle', 'Angle');

  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 10,
    hardMin: 0,
    hardMax: 50
  });
};

module.exports = DirectionalBlurParameters;
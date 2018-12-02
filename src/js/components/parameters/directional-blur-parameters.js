"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function DirectionalBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 1),
    intensity: getProp(values, 'intensity', 3),
    iterations: 175.,
    parabolaFactor: getProp(values, 'parabolaFactor', 3)
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

  this.setElement('parabolaFactor', 'range', 'Parabola factor', {
    softMin: 0.1,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });
};

module.exports = DirectionalBlurParameters;
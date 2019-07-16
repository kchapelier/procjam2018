"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function AnisotropicBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'rotate', 0),
    intensity: getProp(values, 'intensity', 0),
    anisotropy: getProp(values, 'anisotropy', 0),
    parabolaFactor: getProp(values, 'parabolaFactor', 3)
  };
}

extendClass(AnisotropicBlurParameters, BaseParameters);

AnisotropicBlurParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'angle', 'Angle');

  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('anisotropy', 'range', 'Anisotropy', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('parabolaFactor', 'range', 'Parabola factor', {
    softMin: 0.1,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });
};

module.exports = AnisotropicBlurParameters;
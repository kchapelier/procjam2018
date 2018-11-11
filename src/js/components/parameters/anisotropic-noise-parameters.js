"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function AnisotropicNoiseParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    rotate: getProp(values, 'rotate', false),
    scale: getProp(values, 'scale', [2, 100]),
    gradient: getProp(values, 'gradient', 1),
    gradientSmoothness: getProp(values, 'gradientSmoothness', 1),
    jitter: getProp(values, 'jitter', 1),
    seed: getProp(values, 'seed', 0)
  };
}

extendClass(AnisotropicNoiseParameters, BaseParameters);

AnisotropicNoiseParameters.prototype.initializeElements = function () {
  this.setElement('rotate', 'boolean', 'Rotate at 90 degrees');

  this.setElement('scale', 'vector', 'Scale', {
    items: 2,
    steps: 1,
    softMin: 1,
    softMax: 256,
    hardMin: 1,
    hardMax: 2048
  });

  this.setElement('jitter', 'range', 'Jitter', {
    softMin: 0,
    softMax: 1,
    hardMin: -2,
    hardMax: 2
  });

  this.setElement('gradient', 'range', 'Gradient', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('gradientSmoothness', 'range', 'Gradient smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('seed', 'range', 'Seed', {
    steps: 1,
    softMin: 0,
    softMax: 100000,
    hardMin: 0,
    hardMax: 100000
  });
};

module.exports = AnisotropicNoiseParameters;
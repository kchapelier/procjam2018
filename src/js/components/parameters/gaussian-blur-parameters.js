"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GaussianBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    kernelSize: getProp(values, 'kernelSize', 63),
    sigma: getProp(values, 'sigma', 3),
    iterations: getProp(values, 'iterations', 1)
  };
}

extendClass(GaussianBlurParameters, BaseParameters);

GaussianBlurParameters.prototype.initializeElements = function () {
  this.setElement('kernelSize', 'range', 'kernelSize', {
    steps: 1,
    softMin: 9,
    softMax: 63,
    hardMin: 9,
    hardMax: 63
  });

  this.setElement('sigma', 'range', 'Sigma', {
    softMin: 1,
    softMax: 16,
    hardMin: 1,
    hardMax: 16
  });

  /*
  this.setElement('iterations', 'range', 'Iterations', {
    steps: 1,
    softMin: 1,
    softMax: 3,
    hardMin: 1,
    hardMax: 3
  });
  */
};

module.exports = GaussianBlurParameters;
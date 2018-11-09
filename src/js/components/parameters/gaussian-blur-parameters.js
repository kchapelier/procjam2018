"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GaussianBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    sigma: getProp(values, 'sigma', 3),
    iterations: getProp(values, 'iterations', 1)
  };
}

extendClass(GaussianBlurParameters, BaseParameters);

GaussianBlurParameters.prototype.initializeElements = function () {
  //this.setElement('description', 'description', 'Applies a Gaussian blur with a kernel of 63 x 63 (3969 taps) on the input image');

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
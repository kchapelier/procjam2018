"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function PowParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    exponent: getProp(values, 'exponent', 1),
    exponentIntensity: getProp(values, 'exponentIntensity', 0),
    exponentCenteredOnGray: getProp(values, 'exponentCenteredOnGray', false)
  };
}

extendClass(PowParameters, BaseParameters);

PowParameters.prototype.initializeElements = function () {
  this.setElement('exponent', 'range', 'Exponent', {
    softMin: 0,
    softMax: 5,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('exponentIntensity', 'range', 'Exponent map intensity', {
    softMin: -5,
    softMax: 5,
    hardMin: -10,
    hardMax: 10
  });

  this.setElement('exponentCenteredOnGray', 'boolean', 'Exponent map centered on gray', {});
};

module.exports = PowParameters;
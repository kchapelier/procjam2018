"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function HeightToNormalParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    intensity: getProp(values, 'intensity', 2),
    fineDetails: getProp(values, 'fineDetails', 0.5),
    format: getProp(values, 'format', 0)
  };
}

extendClass(HeightToNormalParameters, BaseParameters);

HeightToNormalParameters.prototype.initializeElements = function () {
  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 4,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('fineDetails', 'range', 'Fine details', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('format', 'select', 'Format', {
    options: [
      [0, 'OpenGL'],
      [1, 'DirectX']
    ]
  });
};

module.exports = HeightToNormalParameters;
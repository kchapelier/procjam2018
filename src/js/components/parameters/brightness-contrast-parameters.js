"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function BrightnessContrastParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    brightness: getProp(values, 'brightness', 0),
    contrast: getProp(values, 'contrast', 0)
  };
}

extendClass(BrightnessContrastParameters, BaseParameters);

BrightnessContrastParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Type', {
    options: [
      [0, 'Standard'],
      [1, 'Smooth']
    ]
  });

  this.setElement('brightness', 'range', 'Brightness', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('contrast', 'range', 'Contrast', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });
};

module.exports = BrightnessContrastParameters;
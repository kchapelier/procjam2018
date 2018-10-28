"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GradientNoiseParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    scale: getProp(values, 'scale', 2),
    smoothness: getProp(values, 'smoothness', 0.5),
    remapping: getProp(values, 'remapping', 0.18),
    seed: getProp(values, 'seed', 0)
  };
}

extendClass(GradientNoiseParameters, BaseParameters);

GradientNoiseParameters.prototype.initializeElements = function () {
  this.setElement('scale', 'range', 'Scale', {
    steps: 1,
    softMin: 1,
    softMax: 80,
    hardMin: 1,
    hardMax: 200
  });

  this.setElement('smoothness', 'range', 'Smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('remapping', 'range', 'Value remapping', {
    softMin: 0,
    softMax: 0.25,
    hardMin: 0,
    hardMax: 0.25
  });

  this.setElement('seed', 'range', 'Seed', {
    steps: 1,
    softMin: 0,
    softMax: 100000,
    hardMin: 0,
    hardMax: 100000
  });
};

module.exports = GradientNoiseParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function VoronoiseParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    scale: getProp(values, 'scale', 2),
    smoothness: getProp(values, 'smoothness', 0.5),
    jitter: getProp(values, 'jitter', 0.5),
    seed: getProp(values, 'seed', 0)
  };
}

extendClass(VoronoiseParameters, BaseParameters);

VoronoiseParameters.prototype.initializeElements = function () {
  this.setElement('scale', 'range', 'Scale', {
    steps: 1,
    softMin: 1,
    softMax: 50,
    hardMin: 1,
    hardMax: 200
  });

  this.setElement('smoothness', 'range', 'Smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('jitter', 'range', 'Jitter', {
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

module.exports = VoronoiseParameters;
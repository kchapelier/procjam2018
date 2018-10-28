"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ValueNoiseParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    scale: getProp(values, 'scale', 2),
    smoothness: getProp(values, 'smoothness', 0.5),
    seed: getProp(values, 'seed', 0),
    deformShape: getProp(values, 'deformShape', 0),
    deformAmount: getProp(values, 'deformAmount', 0)
  };
}

extendClass(ValueNoiseParameters, BaseParameters);

ValueNoiseParameters.prototype.initializeElements = function () {
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

  this.setElement('deformShape', 'range', 'Deform shape', {
    softMin: 0,
    softMax: 10,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('deformAmount', 'range', 'Deform amount', {
    softMin: 0,
    softMax: 2,
    hardMin: 0,
    hardMax: 2
  });

  this.setElement('seed', 'range', 'Seed', {
    steps: 1,
    softMin: 0,
    softMax: 100000,
    hardMin: 0,
    hardMax: 100000
  });
};

module.exports = ValueNoiseParameters;
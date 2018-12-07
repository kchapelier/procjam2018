"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function JitterFilterParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    intensity: getProp(values, 'intensity', 0.05),
    smoothing: getProp(values, 'smoothing', 30.),
    smoothingCurve: getProp(values, 'smoothingCurve', 1.)
  };
}

extendClass(JitterFilterParameters, BaseParameters);

JitterFilterParameters.prototype.initializeElements = function () {
  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('smoothing', 'range', 'Smoothing', {
    softMin: 1,
    softMax: 50,
    hardMin: 1,
    hardMax: 100,
    steps: 1
  });

  this.setElement('smoothingCurve', 'range', 'Smoothing Curve', {
    softMin: 0.001,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });
};

module.exports = JitterFilterParameters;
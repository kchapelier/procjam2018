"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SelectiveBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    iterations: 14,
    threshold: getProp(values, 'threshold', 0.25),
    channelWeights: getProp(values, 'channelWeights', [0.5, 0.5, 0.5]),
    dist: getProp(values, 'dist', 4.),
    parabolaFactor: getProp(values, 'parabolaFactor', 3.)
  };
}

extendClass(SelectiveBlurParameters, BaseParameters);

SelectiveBlurParameters.prototype.initializeElements = function () {
  this.setElement('threshold', 'range', 'Threshold', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('channelWeights', 'vector', 'Weights', {
    items: 3,
    labels: ['r', 'g', 'b'],
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('dist', 'range', 'Distance', {
    softMin: 0,
    softMax: 8,
    hardMin: 0,
    hardMax: 16
  });

  this.setElement('parabolaFactor', 'range', 'Parabola factor', {
    softMin: 0.1,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });
};

module.exports = SelectiveBlurParameters;
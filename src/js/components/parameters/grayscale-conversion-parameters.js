"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GrayscaleConversionParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    weights: getProp(values, 'weights', [0.33, 0.33, 0.33]),
    normalizeWeights: getProp(values, 'normalizeWeights', true)
  };
}

extendClass(GrayscaleConversionParameters, BaseParameters);

GrayscaleConversionParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Conversion type', {
    options: [
      [0, 'Desaturation'],
      [1, 'Luma'],
      [2, 'Average'],
      [3, 'Maximum'],
      [4, 'Minimum'],
      [5, 'Custom weights']
    ]
  });

  this.setElement('weights', 'vector', 'Channel weights', {
    items: 3,
    labels: ['r','g','b'],
    hardMin: -1,
    hardMax: 2,
    softMin: -1,
    softMax: 2
  });

  this.setElement('normalizeWeights', 'boolean', 'Normalize weights');
};

module.exports = GrayscaleConversionParameters;
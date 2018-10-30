"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function BlendParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    opacity: getProp(values, 'opacity', 0),
    seed: getProp(values, 'seed', 0)
  };
}

extendClass(BlendParameters, BaseParameters);

BlendParameters.prototype.update = function () {
  if (this.values.type === 1) {
    this.elements.seed.enable();
  } else {
    this.elements.seed.disable();
  }
};

BlendParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Blend mode', {
    options: [
      [0, 'Normal'],
      [1, 'Dissolve'],

      [2, 'Lighten only'],
      [3, 'Screen'],
      [4, 'Dodge'],
      [5, 'Addition'],

      [6, 'Darken only'],
      [7, 'Multiply'],
      [8, 'Burn'],

      [9, 'Overlay'],
      [10, 'Soft light'],
      [11, 'Hard light'],

      [12, 'Difference'],
      [13, 'Exclusion'],
      [14, 'Negation'],
      [15, 'Substract'],
      [16, 'Grain extract'],
      [17, 'Grain merge'],
      [18, 'Divide'],

      [19, 'Hue'],
      [20, 'Saturation'],
      [21, 'Color'],
      [22, 'Value'],

      [23, 'Incrust'],
      [24, 'Incrust value'],
      [25, 'Transitioned multiply'],
      [26, 'Weighted lighten only'],
      [27, 'Weighted darken only'],
      [28, 'Weighted multiply'],
      [29, 'Weighted divide']
    ]
  });

  this.setElement('opacity', 'range', 'Opacity', {
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

module.exports = BlendParameters;
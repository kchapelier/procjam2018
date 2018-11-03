"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ColorToMaskParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    color: getProp(values, 'color', [0,0,0]),
    type: getProp(values, 'type', 0),
    range: getProp(values, 'range', 0.1),
    softness: getProp(values, 'softness', 0.3)
  };
}

extendClass(ColorToMaskParameters, BaseParameters);

ColorToMaskParameters.prototype.initializeElements = function () {
  this.setElement('color', 'rgbcolor', 'Color', {});

  this.setElement('type', 'select', 'Type', {
    options: [
      [0, 'RGB'],
      [1, 'HSL'],
      [2, 'Hue'],
      [3, 'Saturation'],
      [4, 'Luminosity']
    ]
  });

  this.setElement('range', 'range', 'Range', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('softness', 'range', 'Softness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = ColorToMaskParameters;
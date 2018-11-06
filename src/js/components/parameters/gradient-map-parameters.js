"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GradientMapParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    orientation: getProp(values, 'orientation', 0),
    invert: getProp(values, 'invert', false),
    position: getProp(values, 'position', 0.5)
  };
}

extendClass(GradientMapParameters, BaseParameters);

GradientMapParameters.prototype.initializeElements = function () {
  this.setElement('orientation', 'select', 'Orientation', {
    options: [
      [0, 'Horizontal'],
      [1, 'Vertical']
    ]
  });

  this.setElement('invert', 'boolean', 'Invent gradient direction');

  this.setElement('position', 'range', 'Gradient input position', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = GradientMapParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ConicGradientParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    tiling: getProp(values, 'tiling', 2),
    rotation: getProp(values, 'rotation', 0),
    position: getProp(values, 'position', 0),
    gradientPosition: getProp(values, 'gradientPosition', 0.5),
    power: getProp(values, 'power', 1)
  };
}

extendClass(ConicGradientParameters, BaseParameters);

ConicGradientParameters.prototype.update = function () {
  if (this.values.type > 0) {
    this.elements.gradientPosition.enable();
  } else {
    this.elements.gradientPosition.disable();
  }
};

ConicGradientParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Gradient type', {
    options: [
      [0, 'Single'],
      [1, 'Back and forth']
    ]
  });

  this.setElement('rotation', 'angle', 'Rotation', {});

  this.setElement('tiling', 'range', 'Tiling', {
    steps: 1,
    softMin: 1,
    softMax: 16,
    hardMin: 1,
    hardMax: 100
  });

  this.setElement('power', 'range', 'Power', {
    softMin: 0,
    softMax: 10,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('gradientPosition', 'range', 'Gradient position', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = ConicGradientParameters;
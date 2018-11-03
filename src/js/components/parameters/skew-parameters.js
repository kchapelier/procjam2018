"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SkewParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    center: getProp(values, 'center', 0.5),
    skew: getProp(values, 'skew', 1),
    orientation: getProp(values, 'orientation', 0)
  };
}

extendClass(SkewParameters, BaseParameters);

SkewParameters.prototype.initializeElements = function () {
  this.setElement('skew', 'range', 'Skew', {
    softMin: -2,
    softMax: 2,
    hardMin: -5,
    hardMax: 5
  });

  this.setElement('center', 'range', 'Center', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('orientation', 'select', 'Orientation', {
    options: [
      [0, 'Horizontal'],
      [1, 'Vertical']
    ]
  })
};

module.exports = SkewParameters;
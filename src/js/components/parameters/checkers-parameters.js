"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function CheckersParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    tiling: getProp(values, 'tiling', 1),
    rotate45: getProp(values, 'rotate45', false),
  };
}

extendClass(CheckersParameters, BaseParameters);

CheckersParameters.prototype.initializeElements = function () {
  this.setElement('rotate45', 'boolean', 'Rotate at 45 degrees', {});

  this.setElement('tiling', 'range', 'Tiling', {
    steps: 1,
    softMin: 1,
    softMax: 16,
    hardMin: 1,
    hardMax: 100
  });
};

module.exports = CheckersParameters;
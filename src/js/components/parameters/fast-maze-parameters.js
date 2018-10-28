"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function FastMazeParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    scale: getProp(values, 'scale', 3),
    wallWidth: getProp(values, 'wallWidth', 0.25),
    seed: getProp(values, 'seed', 0)
  };
}

extendClass(FastMazeParameters, BaseParameters);

FastMazeParameters.prototype.initializeElements = function () {
  this.setElement('scale', 'range', 'Scale', {
    steps: 1,
    softMin: 1,
    softMax: 8,
    hardMin: 1,
    hardMax: 8
  });

  this.setElement('wallWidth', 'range', 'Wall width', {
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

module.exports = FastMazeParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function TexturePatchingParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    rotation: getProp(values, 'rotation', 0),
    tilesNumber: getProp(values, 'tilesNumber', 1),
    seed: getProp(values, 'seed', 0),
    randomization: getProp(values, 'randomization', 0),
    smoothness: getProp(values, 'smoothness', 0)
  };
}

extendClass(TexturePatchingParameters, BaseParameters);

TexturePatchingParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Type', {
    options: [
      [0, 'Corners and center'],
      [1, 'Corners'],
      [2, 'Jittered grid'],
      [3, 'Perturbed hexagons']
    ]
  });

  this.setElement('rotation', 'select', 'Rotation', {
    options: [
      [0, 'None'],
      [1, '180 degrees'],
      [2, '90 degrees']
    ]
  });

  this.setElement('tilesNumber', 'range', 'Number of tiles', {
    softMin: 1,
    softMax: 8,
    hardMin: 1,
    hardMax: 32,
    steps: 1
  });

  this.setElement('seed', 'range', 'Seed', {
    softMin: 0,
    softMax: 32000,
    hardMin: 0,
    hardMax: 32000,
    steps: 1
  });

  this.setElement('randomization', 'range', 'Randomization', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('smoothness', 'range', 'Smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = TexturePatchingParameters;
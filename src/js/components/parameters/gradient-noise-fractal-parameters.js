"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function GradientNoiseFractalParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    minOctave: getProp(values, 'minOctave', 1),
    maxOctave: getProp(values, 'maxOctave', 4),
    direction: getProp(values, 'direction', 0),
    lacunarity: getProp(values, 'lacunarity', 2),
    smoothness: getProp(values, 'smoothness', 0.5),
    remapping: getProp(values, 'remapping', 0.18),
    seed: getProp(values, 'seed', 0),
    displacementAngle: getProp(values, 'displacementAngle', 0),
    displacementAmount: getProp(values, 'displacementAmount', 0),
    displacementSmoothing: getProp(values, 'displacementSmoothing', 0),
    weightReduction: getProp(values, 'weightReduction', 0.5),
    peak: getProp(values, 'peak', 0)
  };
}

extendClass(GradientNoiseFractalParameters, BaseParameters);

GradientNoiseFractalParameters.prototype.initializeElements = function () {
  this.setElement('minOctave', 'range', 'Minimum octave', {
    steps: 1,
    softMin: 0,
    softMax: 12,
    hardMin: 0,
    hardMax: 12
  });

  this.setElement('maxOctave', 'range', 'Maximum octave', {
    steps: 1,
    softMin: 0,
    softMax: 12,
    hardMin: 0,
    hardMax: 12
  });

  this.setElement('lacunarity', 'range', 'Lacunarity', {
    steps: 1,
    softMin: 1,
    softMax: 3,
    hardMin: 1,
    hardMax: 3
  });

  this.setElement('direction', 'select', 'Direction', {
    options: [
      [0, 'Low frequency to high frequency'],
      [1, 'High frequency to low frequency']
    ]
  });

  this.setElement('smoothness', 'range', 'Smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('remapping', 'range', 'Value remapping', {
    softMin: 0,
    softMax: 0.25,
    hardMin: 0,
    hardMax: 0.25
  });

  this.setElement('displacementAngle', 'angle', 'Displacement angle', {});

  this.setElement('displacementAmount', 'range', 'Displacement amount', {
    softMin: 0,
    softMax: 1,
    hardMin: -5,
    hardMax: 5
  });

  this.setElement('displacementSmoothing', 'range', 'Displacement smoothing', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('weightReduction', 'range', 'Weight reduction per octave', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('peak', 'range', 'Peak', {
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

module.exports = GradientNoiseFractalParameters;
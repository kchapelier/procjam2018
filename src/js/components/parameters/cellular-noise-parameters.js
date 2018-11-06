"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function CellularNoiseParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    seed: getProp(values, 'seed', 2),
    scale: getProp(values, 'scale', 2),
    jitter: getProp(values, 'jitter', 1),
    useInterstice: getProp(values, 'useInterstice', false),
    intersticeWidth: getProp(values, 'intersticeWidth', 0.05),
    edgeSmoothness: getProp(values, 'edgeSmoothness', 0.1),

    fillColor: getProp(values, 'fillColor', 0),
    fillMode: getProp(values, 'fillMode', 0),
    fillModeStrength: getProp(values, 'fillModeStrength', 1)
  };
}

extendClass(CellularNoiseParameters, BaseParameters);

CellularNoiseParameters.prototype.update = function () {
  if (this.values.useInterstice) {
    this.elements.intersticeWidth.enable();
    this.elements.edgeSmoothness.enable();
  } else {
    this.elements.intersticeWidth.disable();
    this.elements.edgeSmoothness.disable();
  }
};

CellularNoiseParameters.prototype.initializeElements = function () {
  this.setElement('scale', 'range', 'Scale', {
    steps: 1,
    softMin: 2,
    softMax: 16,
    hardMin: 2,
    hardMax: 32
  });

  this.setElement('jitter', 'range', 'Jitter', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('useInterstice', 'boolean', 'Use interstices');

  this.setElement('intersticeWidth', 'range', 'Interstice width', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('edgeSmoothness', 'range', 'Edges\' smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('fillColor', 'select', 'Fill color', {
    options: [
      [0, 'White'],
      [1, 'Grays'],
      [2, 'Colors']
    ]
  });

  this.setElement('fillMode', 'select', 'Fill mode', {
    options: [
      [0, 'Distance from borders'],
      [1, 'Distance from point']
    ]
  });

  this.setElement('fillModeStrength', 'range', 'Fill mode strength', {
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

module.exports = CellularNoiseParameters;
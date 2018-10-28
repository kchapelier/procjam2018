"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function BricksParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    scale: getProp(values, 'scale', 1),
    intersticeWidth: getProp(values, 'intersticeWidth', 0.1),
    edgeSmoothness: getProp(values, 'edgeSmoothness', 0),
    edgeRoundness: getProp(values, 'edgeRoundness', 0),
    seed: getProp(values, 'seed', 0),
    offsetOddRows: getProp(values, 'offsetOddRows', 0),
    offsetEvenRows: getProp(values, 'offsetEvenRows', 0),
    offsetRandomization: getProp(values, 'offsetRandomization', 0)
  };
}

extendClass(BricksParameters, BaseParameters);

BricksParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Pattern type', {
    options: [
      [0, 'Similar bricks'],
      [1, 'Alternate length']
    ]
  });

  this.setElement('scale', 'range', 'Scale', {
    steps: 1,
    softMin: 1,
    softMax: 16,
    hardMin: 1,
    hardMax: 64
  });

  this.setElement('intersticeWidth', 'range', 'intersticeWidth', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('edgeRoundness', 'range', 'Edge roundness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('edgeSmoothness', 'range', 'Edge smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('offsetOddRows', 'range', 'Odd rows offset', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('offsetEvenRows', 'range', 'Even rows offset', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('offsetRandomization', 'range', 'Offset randomization', {
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

module.exports = BricksParameters;
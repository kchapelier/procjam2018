"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('../../commons/utils');

function MatcapParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    rotation: getProp(values, 'rotation', 0.0),
    zoom: getProp(values, 'zoom', 1.01),
    curveMultiplier: getProp(values, 'curveMultiplier', 1.0),
    curveIncrease: getProp(values, 'curveIncrease', 0.0),
  };
}

extendClass(MatcapParameters, BaseParameters);

MatcapParameters.prototype.initializeElements = function () {
  this.setElement('rotation', 'angle', 'Rotation', {});

  this.setElement('zoom', 'range', 'Zoom', {
    softMin: 1,
    softMax: 2,
    hardMin: 1,
    hardMax: 2
  });

  this.setElement('curveMultiplier', 'range', 'Curve multiplier', {
    softMin: 0.5,
    softMax: 4,
    hardMin: 0.5,
    hardMax: 4
  });

  this.setElement('curveIncrease', 'range', 'Curve increase', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = MatcapParameters;
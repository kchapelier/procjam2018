"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function EmbossParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 0),
    range: getProp(values, 'range', 1),
    depth: getProp(values, 'depth', 1),
    height: getProp(values, 'height', 0.5)
  };
}

extendClass(EmbossParameters, BaseParameters);

EmbossParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'angle', 'Angle', {});

  this.setElement('range', 'range', 'Range', {
    softMin: 1,
    softMax: 10,
    hardMin: 1,
    hardMax: 10
  });

  this.setElement('depth', 'range', 'Depth', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('height', 'range', 'Height', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = EmbossParameters;
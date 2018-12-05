"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function RadialBlurParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 0.05),
    zoom: getProp(values, 'zoom', 0),
    iterations: 200.,
    parabolaFactor: getProp(values, 'parabolaFactor', 3),
    center: getProp(values, 'center', [0.5, 0.5])
  };
}

extendClass(RadialBlurParameters, BaseParameters);

RadialBlurParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'range', 'Angle', {
    softMin: -0.5,
    softMax: 0.5,
    hardMin: -3.1416,
    hardMax: 3.1416
  });

  this.setElement('zoom', 'range', 'Zoom', {
    softMin: 0,
    softMax: 0.5,
    hardMin: 0,
    hardMax: 0.5
  });

  this.setElement('parabolaFactor', 'range', 'Parabola factor', {
    softMin: 0.1,
    softMax: 10,
    hardMin: 0.001,
    hardMax: 50
  });

  this.setElement('center', 'vector', 'Center', {
    items: 2,
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  })
};

module.exports = RadialBlurParameters;
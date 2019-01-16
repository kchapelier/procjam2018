"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function DirectionalWarpParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 0),
    intensity: getProp(values, 'intensity', 0.1),
    intensityCenteredOnGray: getProp(values, 'intensityCenteredOnGray', false),
    angleIntensity: getProp(values, 'angleIntensity', 0),
    angleCenteredOnGray: getProp(values, 'angleIntensity', false)
  };
}

extendClass(DirectionalWarpParameters, BaseParameters);

DirectionalWarpParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'angle', 'Angle', {});

  this.setElement('intensity', 'range', 'Intensity', {
    softMin: -1,
    softMax: 1,
    hardMin: -5,
    hardMax: 5
  });

  this.setElement('intensityCenteredOnGray', 'boolean', 'Intensity centered on gray', {});

  this.setElement('angleIntensity', 'range', 'Angle intensity', {
    softMin: -1,
    softMax: 1,
    hardMin: -5,
    hardMax: 5
  });

  this.setElement('angleCenteredOnGray', 'boolean', 'Rotation centered on gray', {});
};

module.exports = DirectionalWarpParameters;
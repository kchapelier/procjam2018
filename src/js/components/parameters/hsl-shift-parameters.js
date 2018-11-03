"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function HslShiftParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    hueAttenuation: getProp(values, 'hueAttenuation', 0),
    hueShift: getProp(values, 'hueShift', 0),
    saturationShift: getProp(values, 'saturationShift', 0),
    luminosityShift: getProp(values, 'luminosityShift', 0)
  };
}

extendClass(HslShiftParameters, BaseParameters);

HslShiftParameters.prototype.initializeElements = function () {
  this.setElement('hueAttenuation', 'range', 'Hue attenuation', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('hueShift', 'range', 'Hue shift', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('saturationShift', 'range', 'Saturation shift', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('luminosityShift', 'range', 'Luminosity shift', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });
};

module.exports = HslShiftParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalTweakParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    intensity: getProp(values, 'intensity', 1.),
    sharpness: getProp(values, 'sharpness', 0.)
  };
}

extendClass(NormalTweakParameters, BaseParameters);

NormalTweakParameters.prototype.initializeElements = function () {
  this.setElement('intensity', 'range', 'Intensity', {
    softMin: 0,
    softMax: 2,
    hardMin: 0,
    hardMax: 2
  });

  this.setElement('sharpness', 'range', 'sharpness', {
    softMin: -1,
    softMax: 1,
    hardMin: -4,
    hardMax: 4
  });
};

module.exports = NormalTweakParameters;
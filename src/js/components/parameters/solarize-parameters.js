"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SolarizeParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    midPoint: getProp(values, 'midPoint', 0.5)
  };
}

extendClass(SolarizeParameters, BaseParameters);

SolarizeParameters.prototype.initializeElements = function () {
  this.setElement('midPoint', 'range', 'Mid point', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = SolarizeParameters;
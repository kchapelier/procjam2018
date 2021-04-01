"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('../../commons/utils');

function AmbientOcclusionParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    size: getProp(values, 'size', 0.5),
    amount: getProp(values, 'amount', 0.5),
    threshold: getProp(values, 'threshold', 0.1),
    power: getProp(values, 'power', 1.0)
  };
}

extendClass(AmbientOcclusionParameters, BaseParameters);

AmbientOcclusionParameters.prototype.initializeElements = function () {
  this.setElement('size', 'range', 'Size', {
    softMin: 0.2,
    softMax: 1,
    hardMin: 0.2,
    hardMax: 3
  });

  this.setElement('amount', 'range', 'Amount', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('threshold', 'range', 'Threshold', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('power', 'range', 'Power', {
    softMin: 0.5,
    softMax: 2,
    hardMin: 0.5,
    hardMax: 10
  });
};

module.exports = AmbientOcclusionParameters;
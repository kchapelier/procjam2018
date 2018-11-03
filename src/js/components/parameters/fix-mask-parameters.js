"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function FixMaskParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    threshold: getProp(values, 'threshold', 0.5),
    softness: getProp(values, 'softness', 0.5)
  };
}

extendClass(FixMaskParameters, BaseParameters);

FixMaskParameters.prototype.initializeElements = function () {
  this.setElement('threshold', 'range', 'Threshold', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('softness', 'range', 'Softness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = FixMaskParameters;
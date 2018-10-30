"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SharpenParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    sharpen: getProp(values, 'sharpen', 0)
  };
}

extendClass(SharpenParameters, BaseParameters);

SharpenParameters.prototype.initializeElements = function () {
  this.setElement('sharpen', 'range', 'Sharpen', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 10
  });
};

module.exports = SharpenParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('../../commons/utils');

function DitherParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    amount: getProp(values, 'amount', 1.0)
  };
}

extendClass(DitherParameters, BaseParameters);

DitherParameters.prototype.initializeElements = function () {
  this.setElement('amount', 'range', 'Amount', {
    softMin: 0,
    softMax: 4,
    hardMin: 0,
    hardMax: 255
  });
};

module.exports = DitherParameters;
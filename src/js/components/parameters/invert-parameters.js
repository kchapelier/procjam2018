"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function InvertParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    amount: getProp(values, 'amount', 1)
  };
}

extendClass(InvertParameters, BaseParameters);

InvertParameters.prototype.initializeElements = function () {
  this.setElement('amount', 'range', 'Amount', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = InvertParameters;
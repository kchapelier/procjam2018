"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function IsolinesParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    levels: getProp(values, 'levels', 2),
    offset: getProp(values, 'offset', 0)
  };
}

extendClass(IsolinesParameters, BaseParameters);

IsolinesParameters.prototype.initializeElements = function () {
  this.setElement('levels', 'range', 'Levels', {
    steps: 1,
    softMin: 2,
    softMax: 16,
    hardMin: 2,
    hardMax: 16
  });

  this.setElement('offset', 'range', 'Offset', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = IsolinesParameters;
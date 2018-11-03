"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function UniformGrayParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    color: getProp(values, 'color', [0,0,0])
  };
}

extendClass(UniformGrayParameters, BaseParameters);

UniformGrayParameters.prototype.initializeElements = function () {
  this.setElement('color', 'graycolor', 'Color', {});
};

module.exports = UniformGrayParameters;
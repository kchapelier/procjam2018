"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalRotateParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    angle: getProp(values, 'angle', 0.)
  };
}

extendClass(NormalRotateParameters, BaseParameters);

NormalRotateParameters.prototype.initializeElements = function () {
  this.setElement('angle', 'angle', 'Angle', {});
};

module.exports = NormalRotateParameters;
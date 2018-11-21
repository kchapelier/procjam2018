"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalInvertParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    flipX: getProp(values, 'flipX', false),
    flipY: getProp(values, 'flipY', false)
  };
}

extendClass(NormalInvertParameters, BaseParameters);

NormalInvertParameters.prototype.initializeElements = function () {
  this.setElement('flipX', 'boolean', 'Flip X', {});
  this.setElement('flipY', 'boolean', 'Flip Y', {});
};

module.exports = NormalInvertParameters;
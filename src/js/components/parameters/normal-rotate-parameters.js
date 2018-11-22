"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalRotateParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    mode: getProp(values, 'mode', 1),
    angle: getProp(values, 'angle', 0.)
  };
}

extendClass(NormalRotateParameters, BaseParameters);

NormalRotateParameters.prototype.initializeElements = function () {
  this.setElement('mode', 'select', 'Mode', {
    options: [
      [0, 'Rotate only the normal vectors'],
      [1, 'Rotate the whole map']
    ]
  });
  this.setElement('angle', 'angle', 'Angle', {});
};

module.exports = NormalRotateParameters;
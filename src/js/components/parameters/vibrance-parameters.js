"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ImageParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    vibrance: getProp(values, 'vibrance', 0)
  };
}

extendClass(ImageParameters, BaseParameters);

ImageParameters.prototype.initializeElements = function () {
  this.setElement('vibrance', 'range', 'Vibrance', {
    softMin: -2,
    softMax: 2,
    hardMin: -10,
    hardMax: 10
  });
};

module.exports = ImageParameters;
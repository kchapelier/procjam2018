"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ImageParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    color: getProp(values, 'color', [0,0,0])
  };
}

extendClass(ImageParameters, BaseParameters);

ImageParameters.prototype.initializeElements = function () {
  this.setElement('color', 'rgbcolor', 'Color', {});
};

module.exports = ImageParameters;
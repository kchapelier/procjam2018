"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ColorspacesParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    sourceType: getProp(values, 'sourceType', 0),
    outputType: getProp(values, 'outputType', 0)
  };
}

extendClass(ColorspacesParameters, BaseParameters);

ColorspacesParameters.prototype.initializeElements = function () {
  const types = {
    options: [
      [0, 'RGB'],
      [1, 'HSV'],
      [2, 'HSL'],
      [3, 'HSLUV'],
      [4, 'LCH'],
      [5, 'YUV'],
      [6, 'YCbCr'],
      [7, 'CMY']
    ]
  };

  this.setElement('sourceType', 'select', 'Source colorspace', types);
  this.setElement('outputType', 'select', 'Output colorspace', types);
};

module.exports = ColorspacesParameters;
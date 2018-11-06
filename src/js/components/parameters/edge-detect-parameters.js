"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function EdgeDetectParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    filterType: getProp(values, 'filterType', 0),
    outputType: getProp(values, 'outputType', 1),
    maskThreshold: getProp(values, 'maskThreshold', 0.2),
    threshold: getProp(values, 'threshold', 0.4)
  };
}

extendClass(EdgeDetectParameters, BaseParameters);

EdgeDetectParameters.prototype.update = function () {
  if (this.values.outputType === 0) {
    this.elements.maskThreshold.enable();
  } else {
    this.elements.maskThreshold.disable();
  }
};

EdgeDetectParameters.prototype.initializeElements = function () {
  this.setElement('filterType', 'select', 'Filter type', {
    options: [
      [0, 'Sobel'],
      [1, 'Prewitt'],
      [2, 'Frei-Chen']
    ]
  });

  this.setElement('outputType', 'select', 'Output', {
    options: [
      [0, 'Mask'],
      [1, 'Grays'],
      [2, 'Colors']
    ]
  });

  this.setElement('maskThreshold', 'range', 'Mask threshold', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('threshold', 'range', 'Threshold', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = EdgeDetectParameters;
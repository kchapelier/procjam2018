"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ImageParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 1)
  };
}

extendClass(ImageParameters, BaseParameters);

ImageParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Non-rectangular images handling', {
    options: [
      [0, 'Stretch'],
      [1, 'Crop'],
      [2, 'Repeat']
    ]
  });

  this.setElement('image', 'image', 'Image');
};

module.exports = ImageParameters;
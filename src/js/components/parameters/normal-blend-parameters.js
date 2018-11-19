"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function NormalBlendParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 5),
    opacity: getProp(values, 'opacity', 0.5)
  };
}

extendClass(NormalBlendParameters, BaseParameters);

NormalBlendParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Blending type', {
    options: [
      [0, 'Linear'],
      [1, 'Overlay'],
      [2, 'Partial dervivatives'],
      [3, 'Whiteout'],
      [4, 'UDN'],
      [5, 'Reoriented normal mapping'],
      [6, 'Unity']
    ]
  });

  this.setElement('opacity', 'range', 'Opacity', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = NormalBlendParameters;
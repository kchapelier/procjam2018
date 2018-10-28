"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function MirrorParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    mode: getProp(values, 'mode', 0),
    translateAxisX: getProp(values, 'translateAxisX', 0),
    translateAxisY: getProp(values, 'translateAxisY', 0),
    invertAxisX: getProp(values, 'invertAxisX', false),
    invertAxisY: getProp(values, 'invertAxisY', false)
  };
}

extendClass(MirrorParameters, BaseParameters);

MirrorParameters.prototype.update = function () {
  switch (this.values.mode) {
    case 0:
      this.elements.translateAxisX.disable();
      this.elements.invertAxisX.disable();
      this.elements.translateAxisY.enable();
      this.elements.invertAxisY.enable();
      break;
    case 1:
      this.elements.translateAxisX.enable();
      this.elements.invertAxisX.enable();
      this.elements.translateAxisY.disable();
      this.elements.invertAxisY.disable();
      break;
    case 2:
      this.elements.translateAxisX.enable();
      this.elements.invertAxisX.enable();
      this.elements.translateAxisY.enable();
      this.elements.invertAxisY.enable();
      break;
  }
};

MirrorParameters.prototype.initializeElements = function () {
  this.setElement('mode', 'select', 'Mode', {
    options: [
      [0, 'X Axis'],
      [1, 'Y Axis'],
      [2, 'Corners']
    ]
  });

  this.setElement('translateAxisX', 'range', 'Translate X', {
    softMin: -0.5,
    softMax: 0.5,
    hardMin: -0.5,
    hardMax: 0.5
  });

  this.setElement('translateAxisY', 'range', 'Translate Y', {
    softMin: -0.5,
    softMax: 0.5,
    hardMin: -0.5,
    hardMax: 0.5
  });

  this.setElement('invertAxisX', 'boolean', 'Invert X', {});

  this.setElement('invertAxisY', 'boolean', 'Invert Y', {});
};

module.exports = MirrorParameters;
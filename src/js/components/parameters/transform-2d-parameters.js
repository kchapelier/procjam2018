"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function Transform2DParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    repeatSafe: getProp(values, 'repeatSafe', false),
    translate: getProp(values, 'translate', [0, 0]),
    scale: getProp(values, 'scale', [1, 1]),
    rotation: getProp(values, 'rotation', 0)
  };
}

extendClass(Transform2DParameters, BaseParameters);

Transform2DParameters.prototype.initializeElements = function () {
  this.setElement('repeatSafe', 'boolean', 'Repeat safe mode');

  this.setElement('translate', 'vector', 'Translate', {
    items: 2,
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('rotation', 'angle', 'Rotation', {});

  this.setElement('scale', 'vector', 'Scale', {
    items: 2,
    softMin: 1,
    softMax: 8,
    hardMin: 1,
    hardMax: 16
  });
};

module.exports = Transform2DParameters;
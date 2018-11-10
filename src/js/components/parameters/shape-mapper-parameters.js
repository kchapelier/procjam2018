"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ShapeMapperParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    type: getProp(values, 'type', 0),
    radius: getProp(values, 'radius', 0),
    width: getProp(values, 'width', 1),
    rotation: getProp(values, 'rotation', 0),
    segments: getProp(values, 'segments', 6),
    patternAmount: getProp(values, 'patternAmount', 6),
    rowNumber: getProp(values, 'rowNumber', 1),
    patternRotation: getProp(values, 'patternRotation', 0)
  };
}

extendClass(ShapeMapperParameters, BaseParameters);

ShapeMapperParameters.prototype.update = function () {
  if (this.values.type === 1) {
    this.elements.segments.enable();
    this.elements.patternRotation.enable();
  } else {
    this.elements.segments.disable();
    this.elements.patternRotation.disable();
  }
};

ShapeMapperParameters.prototype.initializeElements = function () {
  this.setElement('type', 'select', 'Type', {
    options: [
      [0, 'Circle'],
      [1, 'Polygons']
    ]
  });

  this.setElement('radius', 'range', 'Radius', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('width', 'range', 'Width', {
    softMin: 0,
    softMax: 2,
    hardMin: 0,
    hardMax: 2
  });

  this.setElement('rotation', 'angle', 'Rotation');

  this.setElement('segments', 'range', 'Segments', {
    steps: 1,
    softMin: 3,
    softMax: 10,
    hardMin: 3,
    hardMax: 32
  });

  this.setElement('patternAmount', 'range', 'Pattern amount', {
    steps: 1,
    softMin: 1,
    softMax: 10,
    hardMin: 1,
    hardMax: 64
  });

  this.setElement('rowNumber', 'range', 'Row number', {
    steps: 1,
    softMin: 1,
    softMax: 16,
    hardMin: 1,
    hardMax: 64
  });

  this.setElement('patternRotation', 'angle', 'Pattern rotation');
};

module.exports = ShapeMapperParameters;
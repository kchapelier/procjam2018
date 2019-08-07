"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ShapeParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    tiling: getProp(values, 'tiling', 1),
    shape: getProp(values, 'shape', 0),
    rotate45: getProp(values, 'rotate45', false),
    blendMode: getProp(values, 'blendMode', 0),
    angle: getProp(values, 'angle', 0),
    size: getProp(values, 'size', [0.75, 0.75]),
    specific: getProp(values, 'specific', 0),
    hq: getProp(values, 'hq', false)
  };
}

extendClass(ShapeParameters, BaseParameters);

const withSpecificParam = [9, 10, 11, 21, 16, 14, 17, 18, 19, 20, 22];

ShapeParameters.prototype.update = function () {
  if (withSpecificParam.indexOf(this.values.shape) > -1) {
    this.elements.specific.enable();
  } else {
    this.elements.specific.disable();
  }
};

ShapeParameters.prototype.initializeElements = function () {
  this.setElement('rotate45', 'boolean', 'Rotate at 45 degrees', {});

  this.setElement('shape', 'select', 'Shape', {
    options: [
      [0, 'Square'],
      [21, 'Round square'],
      [1, 'Disc'],
      [2, 'Paraboloid'],
      [3, 'Sine'],
      [4, 'Lancosz'],
      [5, 'Blackmann-Harris'],
      [6, 'Gaussian'],
      [7, 'Thorn'],
      [8, 'Pyramid'],
      [9, 'Gradation'],
      [10, 'Waves'],
      [11, 'Capsule'],
      [12, 'Cone'],
      [13, 'Hemisphere'],
      [14, 'Fiber'],
      [15, 'Triangle'],
      [16, 'Triangle pick'],
      [17, 'N-ellipse (2 foci)'],
      [18, 'N-ellipse (3 foci)'],
      [19, 'N-ellipse (4 foci)'],
      [20, 'N-ellipse (5 foci)'],
      [22, 'Biconvex lens']
    ]
  });

  this.setElement('blendMode', 'select', 'Blend mode (for overlapping shapes)', {
    options: [
      [0, 'Additive'],
      [1, 'Maximum']
    ]
  });

  this.setElement('tiling', 'range', 'Tiling', {
    steps: 1,
    softMin: 1,
    softMax: 32,
    hardMin: 1,
    hardMax: 100
  });

  this.setElement('angle', 'angle', 'Rotation', {});

  this.setElement('size', 'vector', 'Size', {
    items: 2,
    softMin: 0,
    softMax: 5,
    hardMin: 0,
    hardMax: 5
  });

  this.setElement('specific', 'range', 'Shape specific attribute', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('hq', 'boolean', 'High quality', {});
};

module.exports = ShapeParameters;
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
    size: getProp(values, 'size', [1, 1]),
    specific: getProp(values, 'specific', 0)
  };
}

extendClass(ShapeParameters, BaseParameters);

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

};

module.exports = ShapeParameters;
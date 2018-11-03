"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function MakeTileableParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    smoothness: getProp(values, 'smoothness', 0.5),
    size: getProp(values, 'size', 0.4),
    perturbationIntensity: getProp(values, 'perturbationIntensity', 0.5),
    gammaCorrection: 0 // TODO currently hardcoded because not properly implemented
  };
}

extendClass(MakeTileableParameters, BaseParameters);

MakeTileableParameters.prototype.initializeElements = function () {
  this.setElement('size', 'range', 'Size of the added patches', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('smoothness', 'range', 'Smoothness of the added patches', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('perturbationIntensity', 'range', 'Perturbation in the blending of the patches', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });
};

module.exports = MakeTileableParameters;
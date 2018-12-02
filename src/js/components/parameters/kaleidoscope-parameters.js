"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function KaleidoscopeParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    mode: getProp(values, 'mode', 0),
    kaleid1: getProp(values, 'kaleid1', 8),
    kaleid2: getProp(values, 'kaleid2', 3),
    kaleid2Position: getProp(values, 'kaleid2Position', 0.5),
    stretch: getProp(values, 'stretch', [1.5, 2]),
    distortionAmount: getProp(values, 'distortionAmount', 0.),
    lensEffect1Power: getProp(values, 'lensEffect1Power', 1),
    lensEffect1Amount: getProp(values, 'lensEffect1Amount', 0),
    lensEffect1MidPoint: getProp(values, 'lensEffect1MidPoint', 0.5),
    lensEffect2Power: getProp(values, 'lensEffect2Power', 1),
    lensEffect2Amount: getProp(values, 'lensEffect2Amount', 0),
    lensEffect2MidPoint: getProp(values, 'lensEffect2MidPoint', 0.5)
  };
}

extendClass(KaleidoscopeParameters, BaseParameters);

KaleidoscopeParameters.prototype.initializeElements = function () {

  this.setElement('kaleid1', 'range', 'First mirrors', {
    softMin: 1,
    softMax: 12,
    hardMin: 1,
    hardMax: 50,
    steps: 1
  });

  this.setElement('kaleid2', 'range', 'Second mirrors', {
    softMin: 1,
    softMax: 12,
    hardMin: 1,
    hardMax: 50,
    steps: 1
  });

  this.setElement('kaleid2Position', 'range', 'Second mirrors position', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('stretch', 'vector', 'Stretch', {
    items: 2,
    softMin: 0,
    softMax: 4,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('distortionAmount', 'range', 'Distortion amount', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('lensEffect1Amount', 'range', 'Lens 1 amount', {
    softMin: 0,
    softMax: 5,
    hardMin: -10,
    hardMax: 10
  });

  this.setElement('lensEffect1Power', 'range', 'Lens 1 power', {
    softMin: 0.01,
    softMax: 3,
    hardMin: 0.01,
    hardMax: 10
  });

  this.setElement('lensEffect1MidPoint', 'range', 'Lens 1 mid-point', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('lensEffect2Amount', 'range', 'Lens 2 amount', {
    softMin: 0,
    softMax: 5,
    hardMin: -10,
    hardMax: 10
  });

  this.setElement('lensEffect2Power', 'range', 'Lens 2 power', {
    softMin: 0.01,
    softMax: 3,
    hardMin: 0.01,
    hardMax: 10
  });

  this.setElement('lensEffect2MidPoint', 'range', 'Lens 2 mid-point', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });


};

module.exports = KaleidoscopeParameters;
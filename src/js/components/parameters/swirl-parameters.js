"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SwirlParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    innerAngle: getProp(values, 'innerAngle', 1),
    smoothness: getProp(values, 'smoothness', 1),
    power: getProp(values, 'power', 1),
    innerRadius: getProp(values, 'innerRadius', 0),
    radius: getProp(values, 'radius', 1),
    centerX: getProp(values, 'centerX', 0),
    centerY: getProp(values, 'centerY', 0)
  };
}

extendClass(SwirlParameters, BaseParameters);

SwirlParameters.prototype.initializeElements = function () {
  this.setElement('innerAngle', 'range', 'Inner angle', {
    softMin: -6.2831,
    softMax: 6.2831,
    hardMin: -20,
    hardMax: 20
  });

  this.setElement('smoothness', 'range', 'Smoothness', {
    softMin: 0,
    softMax: 1,
    hardMin: 0,
    hardMax: 1
  });

  this.setElement('power', 'range', 'Power', {
    softMin: 0.5,
    softMax: 5,
    hardMin: 0.5,
    hardMax: 5
  });

  this.setElement('innerRadius', 'range', 'Inner radius', {
    softMin: 0,
    softMax: 2,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('radius', 'range', 'Radius', {
    softMin: 0,
    softMax: 2,
    hardMin: 0,
    hardMax: 10
  });

  this.setElement('centerX', 'range', 'Center X', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });

  this.setElement('centerY', 'range', 'Center Y', {
    softMin: -1,
    softMax: 1,
    hardMin: -1,
    hardMax: 1
  });
};

module.exports = SwirlParameters;
"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function SwirlParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    outerAngle: getProp(values, 'outerAngle', 0),
    innerAngle: getProp(values, 'innerAngle', 1),
    power: getProp(values, 'power', 1)
  };
}

extendClass(SwirlParameters, BaseParameters);

SwirlParameters.prototype.initializeElements = function () {
  this.setElement('outerAngle', 'range', 'Outer angle', {
    softMin: -5,
    softMax: 5,
    hardMin: -20,
    hardMax: 20
  });

  this.setElement('innerAngle', 'range', 'Inner angle', {
    softMin: -5,
    softMax: 5,
    hardMin: -20,
    hardMax: 20
  });

  this.setElement('power', 'range', 'Power', {
    softMin: 0,
    softMax: 10,
    hardMin: 0,
    hardMax: 10
  })
};

module.exports = SwirlParameters;
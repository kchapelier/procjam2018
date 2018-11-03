"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function PosterizeParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    levels: getProp(values, 'levels', 4)
  };
}

extendClass(PosterizeParameters, BaseParameters);

PosterizeParameters.prototype.initializeElements = function () {
  this.setElement('levels', 'range', 'Levels', {
    steps: 1,
    softMin: 2,
    softMax: 64,
    hardMin: 2,
    hardMax: 255
  });
};

module.exports = PosterizeParameters;
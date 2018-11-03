"use strict";

const BaseParameters = require('./base-parameters');

const { getProp, extendClass } = require('./../../commons/utils');

function ChannelShuffleParameters (name, values, callback) {
  this.constructor.super.call(this, name, callback);

  this.values = {
    channel1Source: getProp(values, 'channel1Source', 0),
    channel1Invert: getProp(values, 'channel1Invert', false),
    channel2Source: getProp(values, 'channel2Source', 1),
    channel2Invert: getProp(values, 'channel2Invert', false),
    channel3Source: getProp(values, 'channel3Source', 2),
    channel3Invert: getProp(values, 'channel3Invert', false)
  };
}

extendClass(ChannelShuffleParameters, BaseParameters);

ChannelShuffleParameters.prototype.initializeElements = function () {
  var sources = [
    [0, 'Input 1: First channel'],
    [1, 'Input 1: Second channel'],
    [2, 'Input 1: Third channel'],
    [3, 'Input 2: First channel'],
    [4, 'Input 2: Second channel'],
    [5, 'Input 2: Third channel'],
    [6, 'Input 3: First channel'],
    [7, 'Input 3: Second channel'],
    [8, 'Input 3: Third channel']
  ];

  this.setElement('channel1Source', 'select', 'Channel 1 source', {
    options: sources
  });

  this.setElement('channel1Invert', 'boolean', 'Invert channel 1', {});

  this.setElement('channel2Source', 'select', 'Channel 2 source', {
    options: sources
  });

  this.setElement('channel2Invert', 'boolean', 'Invert channel 2', {});

  this.setElement('channel3Source', 'select', 'Channel 3 source', {
    options: sources
  });

  this.setElement('channel3Invert', 'boolean', 'Invert channel 3', {});
};

module.exports = ChannelShuffleParameters;
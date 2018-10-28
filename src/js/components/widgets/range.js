"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

function RangeWidget () {
  this.constructor.super.call(this, 'range');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.range = makeElement('input', { type: 'range' });
  this.input = makeElement('input', { type: 'text', value: '', id: this.id, autocomplete: 'off' });

  this.inputContainer.appendChild(this.range);
  this.inputContainer.appendChild(this.input);
  this.element.appendChild(this.inputContainer);

  this.range.addEventListener('input', e => {
    if (this.updateValue(this.range.value)) {
      this.input.value = this.value;
      this.triggerChangeCallback();
    }
  });

  this.input.addEventListener('input', e => {
    this.input.value = [].concat(this.input.value.replace(',', '.').match(/[0-9\-.]/g)).join('');
  });

  this.input.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (this.updateValue(this.input.value)) {
        this.range.value = this.value;
        this.input.value = this.value;
        this.triggerChangeCallback();
      }
    }
  });

  this.input.addEventListener('change', e => {
    if (this.updateValue(this.input.value)) {
      this.range.value = this.value;
      this.input.value = this.value;
      this.triggerChangeCallback();
    }
  });
}

extendClass(RangeWidget, BaseWidget);

RangeWidget.prototype.updateValue = function (value) {
  const originalWidget = value;
  value = parseFloat(value);

  value = Math.round(value / this.steps) * this.steps;

  // fix rounding error
  value = parseFloat(value.toFixed(8));

  if (this.hardMin !== null) {
    value = Math.max(this.hardMin, value);
  }

  if (this.hardMax !== null) {
    value = Math.min(this.hardMax, value);
  }

  if (value !== this.value || originalWidget !== value.toString()) {
    this.value = value;
    this.refreshSoftRange();
    return true;
  }

  return false;
};

RangeWidget.prototype.refreshSoftRange = function () {
  this.currentMax = Math.max(Math.ceil(this.value), this.currentMax);

  if (this.hardMax !== null) {
    this.currentMax = Math.min(this.hardMax, this.currentMax);
  }

  this.currentMin = Math.min(Math.floor(this.value), this.currentMin);

  if (this.hardMin !== null) {
    this.currentMin = Math.max(this.hardMin, this.currentMin);
  }

  this.range.max = this.currentMax;
  this.range.min = this.currentMin;
};

RangeWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = null;
  this.options = options;

  this.hardMin = getProp(options, 'hardMin', null);
  this.hardMax = getProp(options, 'hardMax', null);
  this.currentMin = getProp(options, 'softMin', 0);
  this.currentMax = getProp(options, 'softMax', 1);
  this.steps = getProp(options, 'steps', 0.001);

  this.range.step = this.steps;
  this.updateValue(value);
  this.range.value = this.value;
  this.input.value = this.value;

  return this;
};

module.exports = RangeWidget;
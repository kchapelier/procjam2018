"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

function VectorWidget () {
  this.constructor.super.call(this, 'vector');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.labels = [];
  this.ranges = [];
  this.inputs = [];
  this.components = [];

  for (let i = 0; i < 4; i++) {
    this.labels.push(makeElement('label', { innerText: '', for: this.id + '-' + i }));
    this.ranges.push(makeElement('input', { type: 'range', id: this.id + '-' + i, 'data-index': i }));
    this.inputs.push(makeElement('input', { type: 'text', value: '', autocomplete: 'off', 'data-index': i }));

    this.components.push(makeElement('div', { className: 'vector-component' }));
    this.components[i].appendChild(this.labels[i]);
    this.components[i].appendChild(this.ranges[i]);
    this.components[i].appendChild(this.inputs[i]);

    this.inputContainer.appendChild(this.components[i]);

    this.ranges[i].addEventListener('input', e => {
      if (this.updateValue(i, this.ranges[i].value)) {
        this.inputs[i].value = this.value[i];
        this.triggerChangeCallback();
      }
    });

    this.inputs[i].addEventListener('input', e => {
      this.inputs[i].value = [].concat(this.inputs[i].value.replace(',', '.').match(/[0-9\-.]/g)).join('');
    });

    this.inputs[i].addEventListener('keypress', e => {
      var code = e.keyCode || e.charCode;

      if (code === 13) {
        e.preventDefault();
        if (this.updateValue(i, this.inputs[i].value)) {
          this.ranges[i].value = this.value[i];
          this.inputs[i].value = this.value[i];
          this.triggerChangeCallback();
        }
      }
    });

    this.inputs[i].addEventListener('change', e => {
      if (this.updateValue(i, this.inputs[i].value)) {
        this.ranges[i].value = this.value[i];
        this.inputs[i].value = this.value[i];
        this.triggerChangeCallback();
      }
    });

  }

  this.element.appendChild(this.inputContainer);
}

extendClass(VectorWidget, BaseWidget);

VectorWidget.prototype.updateValue = function (i, value) {
  const originalWidget = value;
  value = parseFloat(value);

  if (this.hardMin !== null) {
    value = Math.max(this.hardMin, value);
  }

  if (this.hardMax !== null) {
    value = Math.min(this.hardMax, value);
  }

  if (i < this.items && (value !== this.value[i] || originalWidget !== value.toString())) {
    this.value[i] = value;
    this.refreshSoftRange(value);
    return true;
  }

  return false;
};

VectorWidget.prototype.refreshSoftRange = function (value) {
  this.currentMax = Math.max(Math.ceil(value), this.currentMax);

  if (this.hardMax !== null) {
    this.currentMax = Math.min(this.hardMax, this.currentMax);
  }

  this.currentMin = Math.min(Math.floor(value), this.currentMin);

  if (this.hardMin !== null) {
    this.currentMin = Math.max(this.hardMin, this.currentMin);
  }

  for (let i = 0; i < this.items; i++) {
    this.ranges[i].max = this.currentMax;
    this.ranges[i].min = this.currentMin;
  }
};

VectorWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = [];
  this.options = options;

  this.items = Math.max(2, Math.min(4, getProp(options, 'items', 2)));
  this.hardMin = getProp(options, 'hardMin', null);
  this.hardMax = getProp(options, 'hardMax', null);
  this.currentMin = getProp(options, 'softMin', 0);
  this.currentMax = getProp(options, 'softMax', 1);


  const steps = getProp(options, 'steps', 0.001);
  const componentLabels = getProp(options, 'labels', []);
  const defaultLabels = ['x', 'y', 'z', 'w'];

  for (let i = 0; i < this.items; i++) {
    this.labels[i].innerText = componentLabels.length > i ? componentLabels[i] : defaultLabels[i];
    this.value.push(null);
    this.ranges[i].step = steps;
    this.updateValue(i, value && i < value.length ? value[i] : 0);
    this.ranges[i].value = this.value[i];
    this.inputs[i].value = this.value[i];
    this.components[i].classList.remove('hidden');
  }

  for (let i = this.items; i < 4; i++) {
    this.components[i].classList.add('hidden');
  }

  return this;
};

module.exports = VectorWidget;
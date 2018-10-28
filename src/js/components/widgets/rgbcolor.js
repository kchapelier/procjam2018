"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass, arrayToRgb } = require('./../../commons/utils');

function RGBColorWidget () {
  this.constructor.super.call(this, 'rgbcolor');

  this.colorSpan = makeElement('span', { className: 'color-preview' });
  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.labels = [];
  this.ranges = [];
  this.inputs = [];
  this.components = [];

  var labels = ['r', 'g', 'b']

  for (let i = 0; i < 3; i++) {
    this.labels.push(makeElement('label', { innerText: labels[i], for: this.id + '-' + i }));
    this.ranges.push(makeElement('input', { type: 'range', max: 255, min: 0, step: 1, id: this.id + '-' + i, 'data-index': i }));
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
      this.inputs[i].value = [].concat(this.inputs[i].value.match(/[0-9]/g)).join('');
    });

    this.inputs[i].addEventListener('keypress', e => {
      if (e.keyCode === 13) {
        e.preventDefault();
        if (this.updateValue(i, this.inputs[i].value)) {
          this.triggerChangeCallback();
        }

        this.ranges[i].value = this.value[i];
        this.inputs[i].value = this.value[i];
      }
    });

    this.inputs[i].addEventListener('change', e => {
      if (this.updateValue(i, this.inputs[i].value)) {
        this.triggerChangeCallback();
      }

      this.ranges[i].value = this.value[i];
      this.inputs[i].value = this.value[i];
    });

  }

  this.element.appendChild(this.inputContainer);
  this.element.appendChild(this.colorSpan);
}

extendClass(RGBColorWidget, BaseWidget);

RGBColorWidget.prototype.updateValue = function (i, value) {
  value = Math.round(parseFloat(value));
  value = Math.max(0, Math.min(255, value));

  if (i < 3 && this.value[i] !== value) {
    this.value[i] = value;
    this.colorSpan.style.backgroundColor = arrayToRgb(this.value);
    return true;
  }

  return false;
};

RGBColorWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = [0,0,0];
  this.options = options;

  for (let i = 0; i < 3; i++) {
    this.updateValue(i, value && i < value.length ? value[i] : 0);
    this.ranges[i].value = this.value[i];
    this.inputs[i].value = this.value[i];
  }

  return this;
};

module.exports = RGBColorWidget;
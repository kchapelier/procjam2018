"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass, arrayToRgb } = require('./../../commons/utils');

function GrayColorWidget () {
  this.constructor.super.call(this, 'graycolor');

  this.colorSpan = makeElement('span', { className: 'color-preview' });
  this.inputContainer = makeElement('div', { className: 'input-container' });

  this.labelComplement = makeElement('label', { innerText: 'w', for: this.id + '-0' });
  this.range = makeElement('input', { type: 'range', max: 255, min: 0, step: 1, id: this.id + '-0', 'data-index': 0 });
  this.input = makeElement('input', { type: 'text', value: '', autocomplete: 'off', 'data-index': 0 });

  this.component = makeElement('div', { className: 'vector-component' });
  this.component.appendChild(this.labelComplement);
  this.component.appendChild(this.range);
  this.component.appendChild(this.input);

  this.inputContainer.appendChild(this.component);

  this.range.addEventListener('input', e => {
    if (this.updateValue(this.range.value)) {
      this.input.value = this.value[0];
      this.triggerChangeCallback();
    }
  });

  this.input.addEventListener('input', e => {
    this.input.value = [].concat(this.input.value.match(/[0-9]/g)).join('');
  });

  this.input.addEventListener('keypress', e => {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (this.updateValue(this.input.value)) {
        this.triggerChangeCallback();
      }

      this.range.value = this.value[0];
      this.input.value = this.value[0];
    }
  });

  this.input.addEventListener('change', e => {
    if (this.updateValue(this.input.value)) {
      this.triggerChangeCallback();
    }

    this.range.value = this.value[0];
    this.input.value = this.value[0];
  });


  this.element.appendChild(this.inputContainer);
  this.element.appendChild(this.colorSpan);
}

extendClass(GrayColorWidget, BaseWidget);

GrayColorWidget.prototype.updateValue = function (value) {
  value = Math.round(parseFloat(value));
  value = Math.max(0, Math.min(255, value));

  if (this.value[0] !== value) {
    this.value[0] = this.value[1] = this.value[2] = value;
    this.colorSpan.style.backgroundColor = arrayToRgb(this.value);
    return true;
  }

  return false;
};

GrayColorWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = [0,0,0];
  this.options = options;

  this.updateValue(value[0]);
  this.range.value = this.value[0];
  this.input.value = this.value[0];

  return this;
};

module.exports = GrayColorWidget;
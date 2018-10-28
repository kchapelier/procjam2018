"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

function TextWidget () {
  this.constructor.super.call(this, 'text');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.input = makeElement('input', { type: 'text', value: '', id: this.id, autocomplete: 'off' });

  this.inputContainer.appendChild(this.input);
  this.element.appendChild(this.inputContainer);

  this.regex = null;

  this.input.addEventListener('input', e => {
    var value = this.input.value;

    if (this.regex !== null) {
      value = this.input.value.match(this.regex);

      value = value ? value.join('') : '';
    }

    if (this.input.value !== value) {
      this.input.value = value;
    }

    value = value.trim();

    if (this.value !== value) {
      this.value = value;
      this.triggerChangeCallback();
    }
  });
}

extendClass(TextWidget, BaseWidget);

TextWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.regex = getProp(options, 'regex', null);

  this.value = value;
  this.input.value = this.value;

  return this;
};

module.exports = TextWidget;
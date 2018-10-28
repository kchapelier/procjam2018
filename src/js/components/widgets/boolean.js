"use strict";

const BaseWidget = require('./base');
const { makeElement, extendClass } = require('./../../commons/utils');

function BooleanWidget () {
  this.constructor.super.call(this, 'boolean');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.input = makeElement('button', { type: 'button', id: this.id });

  this.inputContainer.appendChild(this.input);
  this.element.appendChild(this.inputContainer);

  this.input.addEventListener('click', e => {
    this.value = !this.value;
    this.refreshButton();
    this.triggerChangeCallback();
  });
}

extendClass(BooleanWidget, BaseWidget);

BooleanWidget.prototype.refreshButton = function () {
  if (this.value) {
    this.input.classList.add('enabled');
  } else {
    this.input.classList.remove('enabled');
  }
};

BooleanWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);
  this.value = value;

  this.input.innerText = label;
  this.refreshButton();

  return this;
};

module.exports = BooleanWidget;
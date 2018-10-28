"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

function SelectWidget () {
  this.constructor.super.call(this, 'select');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.selectContainer = makeElement('div', { className: 'select-container' });
  this.input = makeElement('select', { id: this.id, autocomplete: 'off' });

  this.selectContainer.appendChild(this.input);
  this.inputContainer.appendChild(this.selectContainer);
  this.element.appendChild(this.inputContainer);

  this.optionsPool = [];

  this.input.addEventListener('change', e => {
    var value = this.options[parseInt(this.input.value, 10)][0];

    if (this.value !== value) {
      this.value = value;
      this.triggerChangeCallback();
    }
  });
}

extendClass(SelectWidget, BaseWidget);

SelectWidget.prototype.getOptions = function (number) {
  var options = [];

  var necessary = number - this.optionsPool.length;

  for (var i = 0; i < necessary; i++) {
    this.optionsPool.push(document.createElement('option'));
  }

  return this.optionsPool.slice(0, number);
};

SelectWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = value;
  this.options = options.options;

  this.input.innerHTML = '';

  var optionsElements = this.getOptions(options.options.length);
  var selectedOption = null;

  for (var i = 0; !!options.options && i < options.options.length; i++) {
    if (options.options[i][0] === value) {
      selectedOption = i;
    }

    optionsElements[i].value = i;
    optionsElements[i].innerText = options.options[i][1];

    this.input.appendChild(optionsElements[i]);
  }

  if (selectedOption !== null) {
    this.input.value = selectedOption;
  }

  return this;
};

module.exports = SelectWidget;
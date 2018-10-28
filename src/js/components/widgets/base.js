"use strict";

const { makeElement } = require('./../../commons/utils');

let id = 0;

const noop = function noop () {};

function BaseWidget (type) {
  this.id = 'component-input-' + type + '-' + (++id);
  this.callback = noop;
  this.value = null;

  this.element = makeElement('div', { className: 'component-input component-input-' + type });
  this.label = makeElement('label', { innerText: '', 'for': this.id });

  this.element.appendChild(this.label);
}

BaseWidget.prototype.injectIn = function (parent) {
  parent.appendChild(this.element);
};

BaseWidget.prototype.enable = function () {
  this.element.classList.remove('disable');
};

BaseWidget.prototype.disable = function () {
  this.element.classList.add('disable');
};

BaseWidget.prototype.triggerChangeCallback = function () {
  this.callback(this.value);
};

BaseWidget.prototype.setLabel = function (label) {
  this.label.innerText = label;
};

BaseWidget.prototype.setCallback = function (callback) {
  this.callback = callback || noop;
};

module.exports = BaseWidget;
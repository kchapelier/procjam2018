"use strict";

const BaseWidget = require('./base');
const { makeElement, extendClass } = require('./../../commons/utils');


function DescriptionWidget () {
  this.constructor.super.call(this, 'description');

  this.parag = makeElement('p', { innerText: '' });
  this.element.appendChild(this.parag);
}

extendClass(DescriptionWidget, BaseWidget);

DescriptionWidget.prototype.initialize = function (label, value, options, callback) {
  this.parag.innerText = label;

  return this;
};

module.exports = DescriptionWidget;
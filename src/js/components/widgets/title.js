"use strict";

const BaseWidget = require('./base');
const { makeElement, extendClass } = require('./../../commons/utils');


function TitleWidget () {
  this.constructor.super.call(this, 'title');

  this.title = makeElement('h2', { innerText: '' });
  this.element.appendChild(this.title);
}

extendClass(TitleWidget, BaseWidget);

TitleWidget.prototype.initialize = function (label, value, options, callback) {
  this.title.innerText = label;

  return this;
};

module.exports = TitleWidget;
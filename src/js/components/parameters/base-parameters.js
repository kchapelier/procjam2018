"use strict";

const Pool = require('./../pool');

const widgetPool = new Pool();
widgetPool.registerType('angle', require('./../widgets/angle'));
widgetPool.registerType('boolean', require('./../widgets/boolean'));
widgetPool.registerType('description', require('./../widgets/description'));
widgetPool.registerType('graycolor', require('./../widgets/graycolor'));
widgetPool.registerType('image', require('./../widgets/image'));
widgetPool.registerType('range', require('./../widgets/range'));
widgetPool.registerType('rgbcolor', require('./../widgets/rgbcolor'));
widgetPool.registerType('select', require('./../widgets/select'));
widgetPool.registerType('text', require('./../widgets/text'));
widgetPool.registerType('title', require('./../widgets/title'));
widgetPool.registerType('vector', require('./../widgets/vector'));

function BaseParameters (name, callback) {
  this.name = name;
  this.callback = callback;
  this.elements = {};
}

BaseParameters.prototype.name = null;

BaseParameters.prototype.update = function () {};

BaseParameters.prototype.triggerChangeCallback = function () {
  this.update();
  this.callback(this.values);
};

BaseParameters.prototype.setElement = function (name, type, label, options) {
  this.elements[name] = widgetPool.getInstance(type).initialize(
    label,
    this.values[name],
    options,
    v => {
      this.values[name] = v;
      this.triggerChangeCallback();
    }
  );
};

BaseParameters.prototype.getElements = function () {
  const frag = document.createDocumentFragment();

  if (Object.keys(this.elements).length === 0) {
    this.setElement(null, 'title', this.name, {});
    this.initializeElements();
  }

  for (let key in this.elements) {
    frag.appendChild(this.elements[key].element);
  }

  this.update();

  return frag;
};

BaseParameters.prototype.freeElements = function () {
  for (let key in this.elements) {
    widgetPool.freeInstance(this.elements[key]);
  }

  this.elements = {};
};

module.exports = BaseParameters;
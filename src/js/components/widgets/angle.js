"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

function AngleWidget () {
  this.constructor.super.call(this, 'angle');

  this.inputContainer = makeElement('div', { className: 'input-container' });
  this.input = makeElement('input', { type: 'text', value: '', id: this.id, autocomplete: 'off' });

  this.svg = makeElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
    width: '120px',
    height: '120px',
    viewBox: '0 0 200 200'
  });

  this.circle = makeElement('circle', {
    cx: 100,
    cy: 100,
    r: 90,
    className: 'circle'
  });

  this.point = makeElement('circle', {
    cx: 175,
    cy: 100,
    r: 7,
    className: 'point'
  });

  this.steps = null;

  this.svg.appendChild(this.circle);
  this.svg.appendChild(this.point);
  this.inputContainer.appendChild(this.svg);
  this.inputContainer.appendChild(this.input);
  this.element.appendChild(this.inputContainer);

  let dragging = false;
  let centerX = 0;
  let centerY = 0;

  const stopFn = e => {
    dragging = false;
    window.removeEventListener('mouseup', stopFn);
    window.removeEventListener('mousemove', moveFn);
  };

  const moveFn = e => {
    if (dragging) {
      this.setAngle(Math.atan2(centerY - e.clientY, e.clientX - centerX));
      this.triggerChangeCallback();
    }
  };

  this.circle.addEventListener('mousedown', e => {
    const bb = this.svg.getBoundingClientRect();

    centerX = bb.x + bb.width / 2;
    centerY = bb.y + bb.height / 2;
    dragging = true;

    window.addEventListener('mouseup', stopFn);
    window.addEventListener('mousemove', moveFn);
  });


  this.input.addEventListener('input', e => {
    this.input.value = [].concat(this.input.value.replace(',', '.').match(/[0-9\-.]/g)).join('');
  });

  this.input.addEventListener('keypress', e => {
    var code = e.keyCode || e.charCode;

    if (code === 13) {
      e.preventDefault();
      var value = parseFloat(this.input.value);

      if (isNaN(value)) {
        this.input.value = this.value;
      } else {
        this.setAngle(value);
        this.triggerChangeCallback();
      }
    }
  });
}

extendClass(AngleWidget, BaseWidget);

AngleWidget.prototype.setAngle = function (angle) {

  if (angle < 0 || angle > Math.PI * 2) {
    angle = (Math.PI * 2 + angle) % (Math.PI * 2);
  }

  if (this.steps !== null) {
    angle = Math.round((angle / (Math.PI * 2)) * this.steps) % this.steps;
    angle = angle / this.steps * (Math.PI * 2);
  }

  angle = parseFloat(angle.toPrecision(6));

  if (this.value !== angle) {
    this.value = angle;
    this.point.style.transform = 'rotate(' + -angle.toFixed(6) + 'rad)';

    this.input.value = this.value;
  }
};

AngleWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = null;
  this.options = options;
  this.steps = getProp(options, 'steps', null);

  this.setAngle(value);

  return this;
};

module.exports = AngleWidget;
"use strict";

const BaseWidget = require('./base');
const { makeElement, getProp, extendClass } = require('./../../commons/utils');

const globalEE = require('../event-emitter').global;

const acceptableTypes = [
  'image/png',
  'image/jpeg'
];

const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const defaultHeightPercents = 66;

function ImageWidget () {
  this.constructor.super.call(this, 'image');

  this.inputContainer = makeElement('div', { className: 'image-container', style: 'padding-top:' + defaultHeightPercents.toFixed(3) + '%;' });
  this.input = makeElement('input', { type: 'file', value: '', id: this.id, accept: acceptableTypes.join(', ') });
  this.buttonContainer = makeElement('div', { className: 'button-container' });
  this.buttonSet = makeElement('button', { type: 'button', innerText: 'Choose a file' });
  this.buttonClear = makeElement('button', { type: 'button', innerText: 'Remove this file', style: 'display:none;' });
  this.img = makeElement('img', { src: transparentPixel });

  this.buttonContainer.appendChild(this.buttonSet);
  this.buttonContainer.appendChild(this.buttonClear);
  this.inputContainer.appendChild(this.img);
  this.inputContainer.appendChild(this.buttonContainer);
  this.inputContainer.appendChild(this.input);
  this.element.appendChild(this.inputContainer);

  var dragging = false;

  this.inputContainer.addEventListener('dragenter', e => {
    e.preventDefault();
    if (!dragging) {
      this.element.classList.add('dragging-file');
      dragging = true;
    }
  });

  this.inputContainer.addEventListener('dragleave', e => {
    if (dragging) {
      this.element.classList.remove('dragging-file');
      dragging = false;
    }
  });

  this.inputContainer.addEventListener('dragover', e => {
    e.preventDefault();
  });

  this.inputContainer.addEventListener('drop', e => {
    e.preventDefault();
    if (dragging) {
      dragging = false;
      this.element.classList.remove('dragging-file');

      if (e.dataTransfer.files.length > 0 && acceptableTypes.indexOf(e.dataTransfer.files[0].type) >= 0) {
        this.setImage(e.dataTransfer.files[0]);
      }
    }
  });

  this.buttonSet.addEventListener('click', e => {
    this.input.click();
  });

  this.buttonClear.addEventListener('click', e => {
    this.clearImage();
  });

  this.input.addEventListener('input', e => {
    if (this.input.files.length === 0 || acceptableTypes.indexOf(this.input.files[0].type) < 0) {
      this.clearImage();
    } else {
      this.setImage(this.input.files[0]);
    }
  });
}

extendClass(ImageWidget, BaseWidget);

ImageWidget.prototype.initialize = function (label, value, options, callback) {
  this.setLabel(label);
  this.setCallback(callback);

  this.value = null;
  this.options = null;

  if (value !== null) {
    this.setImage(value);
  }

  return this;
};

ImageWidget.prototype.clearImage = function () {
  this.input.value = null;

  if (this.value !== null) {
    this.img.onload = _ => {};
    this.img.src = transparentPixel;
    this.inputContainer.style.paddingTop = defaultHeightPercents.toFixed(3) + '%';
    this.buttonClear.style.display = 'none';
    this.value.dispose();
    this.value = null;
    this.triggerChangeCallback();
  }
};

ImageWidget.prototype.setImage = function (file) {
  var reader = new FileReader();
  reader.onload = e => {
    this.img.onload = _ => {
      var percentHeight = Math.min(200, Math.max(33, this.img.naturalHeight / this.img.naturalWidth * 100));

      if (Math.abs(percentHeight - defaultHeightPercents) < 6) {
        percentHeight = 66;
      }

      this.inputContainer.style.paddingTop = percentHeight.toFixed(3) + '%';
      this.buttonClear.style.display = 'inline';

      globalEE.trigger('create-texture-from-image', this.img, webGlTexture => {
        if (this.value !== null) {
          this.value.dispose();
        }
        this.value = webGlTexture;
        this.triggerChangeCallback();
      });
    };
    this.img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

module.exports = ImageWidget;
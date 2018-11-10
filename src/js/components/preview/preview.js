"use strict";

var WorkingContext = require('./../webgl/working-context');
var WorkingProgram = require('./../webgl/working-program');
var WorkingTexture = require('./../webgl/working-texture');
var download = require('./../../commons/download');

function Preview () {
  this.element = document.querySelector('.preview');
  this.saveImageButton = document.querySelector('.save-image-button');
  this.active = false;
  this.shownNode = null;
  this.zoomLevel = 0.;

  this.width = this.element.getBoundingClientRect().width;
  this.height = this.element.getBoundingClientRect().height;

  this.downloadCanvas = document.createElement('canvas');

  this.context = new WorkingContext(this.width, this.height);
  this.texture = new WorkingTexture({ working: this.context }, 1024, 1024, true);
  this.program = new WorkingProgram({ working: this.context }, `#version 300 es

    precision highp float;
    precision highp int;
    precision highp sampler2D;

    layout(location = 0) out vec4 fragColor;

    uniform vec2 resolution;
    uniform float size;

    uniform sampler2D source;
    uniform bool sourceSet;
    uniform vec2 sourceSize;

    vec4 process (in vec2 uv) {
      return sourceSet == true ? texture(source, uv) : vec4(1., 0., 1., 1.);
    }

    void main () {
      vec2 uv = (gl_FragCoord.xy - resolution.xy / 2.) * 1.1 / vec2(min(resolution.x,resolution.y)) + 0.5;
      if (uv.x < 0. || uv.y < 0. || uv.x >= 1. || uv.y >= 1.) {
        fragColor = process(fract(uv)) * 0.3;
      } else {
        fragColor = process(fract(uv));
      }
    }
  `, {
    source: 't'
  });

  this.element.appendChild(this.context.canvas);



  this.setEvents();


  this._render = this.render.bind(this);

  requestAnimationFrame(this._render);
}

Preview.prototype.render = function () {
  if (this.active) {
    this.updateDisplay();
  }

  requestAnimationFrame(this._render);
};

Preview.prototype.resize = function () {
  var bb = this.element.getBoundingClientRect();
  this.width = bb.width;
  this.height = bb.height;
};

Preview.prototype.changeTexture = function (texture) {
  this.texture.updateFromFloatArray(texture.getFloatArray());
};

Preview.prototype.updateDisplay = function () {
  this.program.execute({
    source: this.texture
  }, {
    width: this.width,
    height: this.height
  });
};

Preview.prototype.setEvents = function () {
  document.addEventListener('keyup', e => {
    if (this.active) {
      var code = e.keyCode || e.charCode;

      if (code === 27) { // ESC
        this.hide();
      }
    }
  });

  this.element.addEventListener('dblclick', e => {
    if (this.active) {
      this.hide();
    }
  });

  this.saveImageButton.addEventListener('click', e => {
    e.preventDefault();
    this.saveImageButton.blur();

    this.downloadCanvas.width = this.texture.width;
    this.downloadCanvas.height = this.texture.height;

    this.downloadCanvas.getContext('2d').putImageData(this.texture.getImageData(), 0, 0);

    this.downloadCanvas.toBlob(blob => {
      var d = new Date();
      var filename = 'textool-' + (
        d.getFullYear() + ('0' + (d.getMonth()+1)).substr(-2) + ('0' + d.getDate()).substr(-2) + '-' +
        ('0' + d.getHours()).substr(-2) + ('0' + d.getMinutes()).substr(-2) + ('0' + d.getSeconds()).substr(-2)
      ) + '.png';

      download(blob, 'image/png', filename);
    }, 'image/png');
  })
};

Preview.prototype.show = function (uuid) {
  this.shownNode = uuid;
  this.active = true;
  this.updateDisplay();
  this.element.classList.add('active');
};

Preview.prototype.hide = function () {
  this.shownNode = null;
  this.active = false;
  this.element.classList.remove('active');
};

module.exports = Preview;
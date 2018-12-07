"use strict";

const WorkingContext = require('./../webgl/working-context');
const WorkingProgram = require('./../webgl/working-program');
const WorkingTexture = require('./../webgl/working-texture');
const download = require('./../../commons/download');

function Preview () {
  this.element = document.querySelector('.preview');
  this.saveImageButton = document.querySelector('.save-image-button');
  this.toggleMaskButton = document.querySelector('.toggle-mask-button');
  this.active = false;
  this.shownNode = null;
  this.mask = true;
  this.currentMask = true;
  this.zoomLevel = 1.;
  this.offsetViewX = 0.5;
  this.offsetViewY = 0.5;
  this.needDisplayUpdate = false;

  this.width = this.element.getBoundingClientRect().width;
  this.height = this.element.getBoundingClientRect().height;

  this.downloadCanvas = document.createElement('canvas');

  this.context = new WorkingContext(this.width, this.height);
  this.texture = new WorkingTexture({ working: this.context }, 1024, 1024, true, true);
  this.program = new WorkingProgram({ working: this.context }, `#version 300 es

    precision highp float;
    precision highp int;
    precision highp sampler2D;

    layout(location = 0) out vec4 fragColor;

    uniform vec2 resolution;
    uniform float size;

    uniform bool mask;
    uniform float zoom;
    uniform vec2 offset;

    uniform sampler2D source;
    uniform bool sourceSet;
    uniform vec2 sourceSize;

    vec4 process (in vec2 uv) {
      return sourceSet == true ? clamp(texture(source, uv), 0., 1.) : vec4(1., 0., 1., 1.);
    }

    void main () {
      vec2 uv = (gl_FragCoord.xy - resolution.xy / 2.) / vec2(min(resolution.x,resolution.y));
      uv *= zoom;
      uv += offset;
      if (mask && (uv.x < 0. || uv.y < 0. || uv.x >= 1. || uv.y >= 1.)) {
        fragColor = process(uv) * 0.3;
      } else {
        fragColor = process(uv);
      }
    }
  `, {
    source: 't',
    mask: 'b',
    zoom: 'f',
    offset: '2f'
  });

  this.element.appendChild(this.context.canvas);

  this.setEvents();

  this._render = this.render.bind(this);

  requestAnimationFrame(this._render);
}

Preview.prototype.render = function () {
  if (this.active && this.needDisplayUpdate) {
    this.updateDisplay();
    this.needDisplayUpdate = false;
  }

  requestAnimationFrame(this._render);
};

Preview.prototype.resize = function () {
  const bb = this.element.getBoundingClientRect();
  this.width = bb.width;
  this.height = bb.height;
  this.needDisplayUpdate = true;
};

Preview.prototype.changeTexture = function (texture) {
  this.texture.updateFromFloatArray(texture.getFloatArray());
  this.needDisplayUpdate = true;
};

Preview.prototype.updateDisplay = function () {
  this.program.execute({
    source: this.texture,
    mask: this.currentMask,
    zoom: this.zoomLevel,
    offset: [this.offsetViewX, this.offsetViewY]
  }, {
    width: this.width,
    height: this.height
  });
};

Preview.prototype.setEvents = function () {
  this.down = false;

  window.addEventListener('mousemove', e => {
    if (this.active && this.down) {
      const multiplier = this.zoomLevel / Math.min(this.width, this.height);
      this.offsetViewX -= e.movementX * multiplier;
      this.offsetViewY += e.movementY * multiplier;
      this.needDisplayUpdate = true;
    }
  });

  this.element.addEventListener('wheel', e => {
    if (this.active && e.target.tagName.toLowerCase() === 'canvas') {
      const previousLevel = this.zoomLevel;
      this.zoomLevel = Math.min(5., Math.max(0.2, this.zoomLevel - e.deltaY * 0.0025));

      let multiplier;
      let changeRatio;
      let changeX;
      let changeY;

      if (this.zoomLevel <= previousLevel) {
        multiplier = previousLevel / Math.min(this.width, this.height);
        changeRatio = (previousLevel - this.zoomLevel) / this.zoomLevel;
        changeX = -(this.width / 2 - e.offsetX) * multiplier;
        changeY = (this.height / 2 - e.offsetY) * multiplier;
      } else {
        multiplier = previousLevel / Math.min(this.width, this.height);
        changeRatio = (this.zoomLevel - previousLevel) / this.zoomLevel;
        changeX = (this.width / 2 - e.offsetX) * multiplier;
        changeY = -(this.height / 2 - e.offsetY) * multiplier;
      }

      this.offsetViewX = this.offsetViewX * (1. - changeRatio) + (this.offsetViewX + changeX) * changeRatio;
      this.offsetViewY = this.offsetViewY * (1. - changeRatio) + (this.offsetViewY + changeY) * changeRatio;

      this.needDisplayUpdate = true;
    }
  }, { passive:true });

  document.addEventListener('keydown', e => {
    if (this.active) {
      const code = e.keyCode || e.charCode;

      if (code === 32) {
        this.currentMask = !this.mask;
        this.needDisplayUpdate = true;
      }
    }
  });

  document.addEventListener('keyup', e => {
    if (this.active) {
      const code = e.keyCode || e.charCode;

      if (code === 27) { // ESC
        this.hide();
      } else if (code === 32) {
        this.currentMask = this.mask;
        this.needDisplayUpdate = true;
      }
    }
  });

  this.element.addEventListener('dblclick', e => {
    if (this.active && e.target && e.target.tagName.toLowerCase() !== 'button') {
      e.preventDefault();
      e.stopPropagation();
      this.hide();
    }
  });

  this.element.addEventListener('mousedown', e => {
    e.preventDefault();
    e.stopPropagation();
    this.down = true;
  });

  window.addEventListener('mouseup', e => {
    if (this.active && this.down) {
      this.down = false;
    }
  });

  this.toggleMaskButton.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    this.toggleMaskButton.blur();

    this.mask = !this.mask;
    this.currentMask = !this.currentMask;
    this.needDisplayUpdate = true;
  });

  this.saveImageButton.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    this.saveImageButton.blur();

    this.downloadCanvas.width = this.texture.width;
    this.downloadCanvas.height = this.texture.height;

    this.downloadCanvas.getContext('2d').putImageData(this.texture.getImageData(), 0, 0);

    this.downloadCanvas.toBlob(blob => {
      const d = new Date();
      const filename = 'graph-ical-' + (
        d.getFullYear() + ('0' + (d.getMonth()+1)).substr(-2) + ('0' + d.getDate()).substr(-2) + '-' +
        ('0' + d.getHours()).substr(-2) + ('0' + d.getMinutes()).substr(-2) + ('0' + d.getSeconds()).substr(-2)
      ) + '.png';

      download(blob, 'image/png', filename);
    }, 'image/png');
  });
};

Preview.prototype.show = function (uuid) {
  this.shownNode = uuid;
  this.offsetViewX = 0.5;
  this.offsetViewY = 0.5;
  this.zoomLevel = 1.1;
  this.currentMask = this.mask;
  this.active = true;
  this.updateDisplay();
  this.element.classList.add('active');
};

Preview.prototype.hide = function () {
  this.shownNode = null;
  this.active = false;
  this.needDisplayUpdate = false;
  this.element.classList.remove('active');
};

module.exports = Preview;
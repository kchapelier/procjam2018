"use strict";

const WorkingContext = require('./working-context');
const WorkingProgram = require('./working-program');
const WorkingTexture = require('./working-texture');

const CopyToCanvasProgram = require('./programs/copy-to-canvas');

function Context () {
  this.working = new WorkingContext(32, 32);
}

/**
 *
 * @param {string} fragmentShader
 * @param {object} uniforms
 * @returns {WorkingWebGLProgram}
 */
Context.prototype.createProgram = function (fragmentShader, uniforms) {
  return new WorkingProgram(this, fragmentShader, uniforms);
};

/**
 *
 * @param {int} width
 * @param {int} height
 * @param {bool} repeat
 * @returns {WorkingTexture}
 */
Context.prototype.createTexture = function (width, height, repeat) {
  return new WorkingTexture(this, width, height, repeat, false, false);
};

/**
 *
 * @param canvas
 * @param canvasCtx
 * @param {WorkingTexture} texture
 */
Context.prototype.drawToCanvas = function (canvas, canvasCtx, texture) {
  var canvasSize = Math.min(Math.max(canvas.width, canvas.height), this.working.canvas.width);

  CopyToCanvasProgram.getInstance(this).execute({
    source: texture,
    size: canvasSize
  }, {
    width: texture.width,
    height: texture.height
  });

  canvasCtx.drawImage(this.working.canvas, 0, texture.height - canvasSize, canvasSize, canvasSize, 0, 0, 96, 96);
};

module.exports = Context;
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
 * @returns {WorkingTexture}
 */
Context.prototype.createTexture = function (width, height) {
  return new WorkingTexture(this, width, height);
};

/**
 *
 * @param canvas
 * @param canvasCtx
 * @param texture
 */
Context.prototype.drawToCanvas = function (canvas, canvasCtx, texture) {
  CopyToCanvasProgram.getInstance(this).execute({
    source: texture
  }, {
    width: canvas.width,
    height: canvas.height
  });

  canvasCtx.drawImage(this.working.canvas, 0, 0);
};

module.exports = Context;
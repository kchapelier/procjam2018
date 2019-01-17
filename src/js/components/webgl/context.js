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
 * @param texture
 */
Context.prototype.drawToCanvas = function (canvas, canvasCtx, texture) {
  //TODO something is wrong about this, probable the call to drawImage
  var canvasSize = Math.max(canvas.width, canvas.height);

  CopyToCanvasProgram.getInstance(this).execute({
    source: texture,
    size: canvasSize
  }, {
    width: texture.width,
    height: texture.height
  });

  canvasCtx.drawImage(this.working.canvas, 0, texture.height - canvasSize, canvasSize, canvasSize, 0, 0, canvasSize, canvasSize);
};

module.exports = Context;
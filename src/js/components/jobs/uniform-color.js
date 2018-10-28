"use strict";

var program = null;

/**
 *
 * @param context
 * @returns {WorkingWebGLProgram}
 */
function getProgram (context) {
  if (program === null) {
    program = context.createProgram(`#version 300 es

      precision highp float;
      precision highp int;
      precision highp sampler2D;

      layout(location = 0) out vec4 fragColor;

      uniform vec2 resolution;
      uniform float seed;
      uniform vec3 color;

      void main () {
          fragColor = vec4(color / 255., 1.);
      }

    `, {
      color: '3f'
    });
  }

  return program;
}

function uniformColorJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    color: parameters.color
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = uniformColorJob;
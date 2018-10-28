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
      uniform int type;

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = vec4(uv.x, uv.y, float(type) / 2., 1.);
      }

    `, {
      type: 'i'
    });
  }

  return program;
}

function imageJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    type: parameters.type
  };

  console.log(outputs);
  program.execute(uniforms, outputs.output);

  done();
}

module.exports = imageJob;
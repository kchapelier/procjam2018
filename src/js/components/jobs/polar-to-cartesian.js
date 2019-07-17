"use strict";

var program = null;

//TODO fix this

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

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 cartesianUv = vec2(
          cos(uv.x * 6.283185307179 - 3.141592653589) * uv.y / 2.,
          sin(uv.x * 6.283185307179 - 3.141592653589) * uv.y / 2.
        ) + 0.5;

        cartesianUv.y = fract(1. - cartesianUv.y);

        return texture(source, cartesianUv);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;

          if (sourceSet == true) {
            fragColor = process(uv);
          } else {
            fragColor = vec4(0., 0., 0., 1.);
          }
      }

    `, {
      source: 't'
    });
  }

  return program;
}

function polarToCartesianJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  program.execute({ source: inputs.input }, outputs.output);

  done();
}

module.exports = polarToCartesianJob;
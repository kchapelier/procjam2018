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

      #define PIm2 6.2831853071796

      const int TYPE_SINGLE = 0;
      const int TYPE_BACKFORTH = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int type;
      uniform float rotation;
      uniform int tiling;
      uniform float power;
      uniform float gradientPosition;

      vec4 process (in vec2 uv) {
        uv -= 0.5;

        float a = fract((atan(uv.x, uv.y) + rotation) / PIm2 * float(tiling));

        if (type == TYPE_BACKFORTH) {
            a = a <= gradientPosition ? a / gradientPosition : (1. - a) / (1. - gradientPosition);
        }

        a = pow(a, power);

        return vec4(a, a, a, 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      type: 'i',
      tiling: 'i',
      rotation: 'f',
      power: 'f',
      gradientPosition: 'f'
    });
  }

  return program;
}

function conicGradientJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    type: parameters.type,
    tiling: parameters.tiling,
    rotation: parameters.rotation,
    power: parameters.power,
    gradientPosition: parameters.gradientPosition
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = conicGradientJob;
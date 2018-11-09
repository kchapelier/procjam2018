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

      const int ROTATION_0 = 0;
      const int ROTATION_90 = 1;
      const int ROTATION_180 = 2;
      const int ROTATION_270 = 3;

      const int TYPE_SINGLE = 0;
      const int TYPE_BACKFORTH = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int type;
      uniform int rotation;
      uniform int tiling;
      uniform float power;
      uniform float position;
      uniform float gradientPosition;

      vec4 process (in vec2 uv) {
        float u = mod(float(rotation), 2.) > 0. ? uv.x : uv.y;
        u += position / float(tiling);
        u *= 1. - mod(float(rotation / 2), 2.) * 2.;
        float n = fract(u * float(tiling) - mod(float(tiling) + 1., 2.) / 2.);

        if (type == TYPE_BACKFORTH) {
          n = n <= gradientPosition ? n / gradientPosition : (1. - n) / (1. - gradientPosition);
        }

        n = pow(n, power);

        return vec4(vec3(n), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      type: 'i',
      tiling: 'i',
      rotation: 'i',
      power: 'f',
      position: 'f',
      gradientPosition: 'f'
    });
  }

  return program;
}

function linearGradient2Job (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    type: parameters.type,
    tiling: parameters.tiling,
    rotation: parameters.rotation,
    power: parameters.power,
    position: parameters.position,
    gradientPosition: parameters.gradientPosition
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = linearGradient2Job;
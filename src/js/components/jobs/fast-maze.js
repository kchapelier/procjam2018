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

      uniform int scale;
      uniform float wallWidth;

      float mazeEquation (vec2 co, float m, float t) {
        return mod(sin(m * length(floor(co))) < 0. ? co.x : co.y, 1.) > t ? 1. : 0.;
      }

      vec4 process (in vec2 uv) {
        vec2 iPixelSize = 1. / resolution.xy;
        float iscale = 2. * float(scale);
        uv += vec2(0.665, 0.665) * iPixelSize;
        uv += ceil(vec2(sin(seed*5.13 / 100.), cos(1. + seed*7.1/100.)) * 500.) / iscale;
        uv = fract(uv);

        float iseed = 5070. + seed;

        float g = mazeEquation(uv * iscale, iseed, wallWidth);

        return vec4(vec3(g/1.), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      scale: 'i',
      wallWidth: 'f',
      seed: 'f'
    });
  }

  return program;
}

function fastMazeJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    scale: parameters.scale,
    wallWidth: parameters.wallWidth,
    seed: parameters.seed
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = fastMazeJob;
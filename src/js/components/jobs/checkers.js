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

      uniform bool rotate45;
      uniform int tiling;

      vec2 rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        if (rotate45) {
          uv = (uv + vec2(-uv.y, uv.x) + 0.0001) / 2.;
        }

        uv = floor(uv * float(tiling) * 2.);
        float n = abs(mod(uv.x, 2.) - mod(uv.y, 2.));
        return vec4(vec3(n), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      tiling: 'i',
      rotate45: 'b'
    });
  }

  return program;
}

function checkersJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    tiling: parameters.tiling,
    rotate45: parameters.rotate45
  };

  console.log(outputs);
  program.execute(uniforms, outputs.output);

  done();
}

module.exports = checkersJob;
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

      const int MODE_NORMAL_VECTOR_ONLY = 0;
      const int MODE_WHOLE_MAP = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int mode;
      uniform float angle;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec2 _rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        vec3 n = vec3(0.);

        if (mode == MODE_NORMAL_VECTOR_ONLY) {
          n = (texture(source, uv).rgb - 0.5) * 2.;

          n.rg = _rotate(n.rg, angle);
        } else {
          vec2 nuv = _rotate(uv - 0.5, angle) + 0.5;

          n = (texture(source, nuv).rgb - 0.5) * 2.;

          n.rg = _rotate(n.rg, -angle);
        }

        return vec4(normalize(n) * 0.5 + 0.5, 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;

          if (sourceSet == true) {
            fragColor = process(uv);
          } else {
            fragColor = vec4(0.5, 0.5, 1., 1.);
          }
      }

    `, {
      source: 't',
      angle: 'f',
      mode: 'i'
    });
  }

  return program;
}

function normalRotateJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    mode: parameters.mode,
    angle: parameters.angle
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = normalRotateJob;
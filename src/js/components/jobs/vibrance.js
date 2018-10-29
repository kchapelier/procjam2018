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

      const int MODE_AXIS_X = 0;
      const int MODE_AXIS_Y = 1;
      const int MODE_CORNER = 2;

      uniform vec2 resolution;
      uniform float seed;

      uniform float vibrance;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec3 base = texture(source, uv).rgb;

        float max = max(max(base.r, base.g), base.b);
        float avg = (base.r + base.g + base.b) / 3.;
        float amt = abs(max - avg) * -2. * vibrance;

        if (base.r != max) {
          base.r += (max - base.r) * amt;
        }

        if (base.g != max) {
          base.g += (max - base.g) * amt;
        }

        if (base.b != max) {
          base.b += (max - base.b) * amt;
        }

        return vec4(base, 1.);
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
      vibrance: 'f',
      source: 't'
    });
  }

  return program;
}

function vibranceJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    vibrance: parameters.vibrance
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = vibranceJob;
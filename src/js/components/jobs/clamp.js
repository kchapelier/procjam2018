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

      uniform float minimum;
      uniform float maximum;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv);

        float imaximum = max(minimum, maximum);
        float iminimum = min(minimum, maximum);

        return vec4(clamp(base.rgb, iminimum, imaximum), base.a);
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
      minimum: 'f',
      maximum: 'f',
      source: 't'
    });
  }

  return program;
}

function clampJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    minimum: parameters.minimum,
    maximum: parameters.maximum
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = clampJob;
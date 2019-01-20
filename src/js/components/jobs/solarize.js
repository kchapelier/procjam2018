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

      uniform float midPoint;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float solarize (float v, float midPoint) {
        if (v > midPoint) {
          return 1. - (v - midPoint) / (1. - midPoint);
        } else {
          return v / midPoint;
        }
      }

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv);
        float imidPoint = clamp(midPoint, 0.0001, 0.9999);

        vec3 col = vec3(
          solarize(base.r, imidPoint),
          solarize(base.g, imidPoint),
          solarize(base.b, imidPoint)
        );

        return vec4(col, base.a);
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
      source: 't',
      midPoint: 'f'
    });
  }

  return program;
}

function solarizeJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    midPoint: parameters.midPoint
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = solarizeJob;
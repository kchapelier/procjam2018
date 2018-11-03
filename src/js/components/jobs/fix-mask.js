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

      uniform float threshold;
      uniform float softness;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution.xy;

        float t = (0.130371 + (1. - 0.130371) * (1. - softness)) * (length(texture(source, uv).rgb) / 1.733 > threshold ? 1. : 0.);

        t += 0.115349 * softness * (length(texture(source, uv + p * vec2(1., 1.)).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.115349 * softness * (length(texture(source, uv + p * vec2(-1., -1.)).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.115349 * softness * (length(texture(source, uv + p * vec2(1., -1.)).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.115349 * softness * (length(texture(source, uv + p * vec2(-1., 1.)).rgb) / 1.733 > threshold ? 1. : 0.);

        t += 0.102059 * softness * (length(texture(source, uv + p * vec2(0., 1.) * 0.7071).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.102059 * softness * (length(texture(source, uv + p * vec2(0., -1.) * 0.7071).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.102059 * softness * (length(texture(source, uv + p * vec2(1., 0.) * 0.7071).rgb) / 1.733 > threshold ? 1. : 0.);
        t += 0.102059 * softness * (length(texture(source, uv + p * vec2(-1., 0.) * 0.7071).rgb) / 1.733 > threshold ? 1. : 0.);

        return vec4(vec3(clamp(t, 0., 1.)), 1.);
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
      threshold: 'f',
      softness: 'f'
    });
  }

  return program;
}

function fixMaskJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    threshold: parameters.threshold,
    softness: parameters.softness
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = fixMaskJob;
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

      uniform float exponent;
      uniform float exponentIntensity;
      uniform bool exponentCenteredOnGray;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D exponentMap;
      uniform bool exponentMapSet;
      uniform vec2 exponentMapSize;

      vec4 process (in vec2 uv) {
        vec3 base = vec3(0.);
        float e = 0.;

        if (exponentMapSet == true) {
          base = texture(exponentMap, uv).rgb;
          e = (base.r + base.g + base.b) / 3.;

          if (exponentCenteredOnGray == true) {
              e = e * 2. - 1.;
          }

          e *= exponentIntensity;
        }

        float iexponent = max(0.00001, exponent + e);

        base = texture(source, uv).rgb;

        return vec4(pow(base.rgb, vec3(iexponent)), 1.);
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
      exponentMap: 't',
      exponent: 'f',
      exponentIntensity: 'f',
      exponentCenteredOnGray: 'b'
    });
  }

  return program;
}

function powJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    exponentMap: inputs.exponent,
    exponent: parameters.exponent,
    exponentIntensity: parameters.exponentIntensity,
    exponentCenteredOnGray: parameters.exponentCenteredOnGray
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = powJob;
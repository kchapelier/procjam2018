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

      uniform float intensity;
      uniform float sharpness;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec3 n = (texture(source, uv).rgb - 0.5) * 2.;
        vec3 m = vec3(0.);


        for (float x = -2.; x <= 2.; x++)
        for (float y = -2.; y <= 2.; y++)
          m+= max(1., max(abs(x), abs(y))) * (texture(source, uv + vec2(x, y) / resolution.xy).rgb - 0.5) * 2.;

        n = normalize(mix(m/24., n, sharpness));

        n = mix(vec3(0., 0., 1.), n, intensity);

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
      intensity: 'f',
      sharpness: 'f'
    });
  }

  return program;
}

function normalTweakJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    intensity: parameters.intensity,
    sharpness: parameters.sharpness
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = normalTweakJob;
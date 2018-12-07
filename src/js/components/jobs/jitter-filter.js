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
      uniform float smoothing;
      uniform float smoothingCurve;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float rand(const in vec2 co, const in float n){
        return fract(sin(dot(co.xy, vec2(12.9898 - n,78.233 + n * 2.))) * 43758.5453 + n);
      }

      vec4 process (in vec2 uv) {
        vec3 g = vec3(0.);

        for (float i = 1.; i <= smoothing; i++) {
          float a = rand(uv, 1. + i) * 6.2831853;
          float l = rand(uv, 1. - i);

          vec2 d = vec2(cos(a), sin(a)) * l * intensity * pow(1. / i, smoothingCurve);

          d = round(d * sourceSize) / sourceSize;

          g += clamp(texture(source, uv + d).rgb, 0., 1.);
        }

        g = clamp(g / smoothing, 0., 1.);

        return vec4(g, 1.);
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
      intensity: 'f',
      smoothing: 'f',
      smoothingCurve: 'f',
      source: 't'
    });
  }

  return program;
}

function jitterFilterJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var uniforms = {
    source: inputs.input,
    intensity: parameters.intensity,
    smoothing: parameters.smoothing,
    smoothingCurve: parameters.smoothingCurve
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = jitterFilterJob;
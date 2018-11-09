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

      uniform float angle;
      uniform float intensity;
      uniform float iterations;
      uniform float parabolaFactor;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution;

        vec4 base = vec4(0.);
        float sum = 0.;
        float w = 0.;
        float k = 0.;

        float dist = length(resolution) / iterations * intensity;

        vec2 dir = vec2(cos(angle), sin(angle)) * dist / 100.;

        for (float t = -iterations; t <= iterations; t++) {
            k = (t + iterations) / (iterations * 2. + 0.00001);
            w = pow(4.0 * k * (1. - k), parabolaFactor); // inlined _parabola()
            base += texture(source, uv + p * dir * t) * w;
            sum += w;
        }

        return vec4(clamp(base.rgb / sum, 0., 1.), 1.);
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
      angle: 'f',
      intensity: 'f',
      iterations: 'f',
      parabolaFactor: 'f'
    });
  }

  return program;
}

function sharpenJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    angle: parameters.angle,
    intensity: parameters.intensity,
    iterations: parameters.iterations,
    parabolaFactor: parameters.parabolaFactor
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = sharpenJob;
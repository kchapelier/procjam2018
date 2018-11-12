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

      uniform bool rotate;
      uniform vec2 scale;
      uniform float gradient;
      uniform float gradientSmoothness;
      uniform float jitter;

      vec4 process (in vec2 uv) {
        float iseed = 0.02932842 + seed / 103.;

        if (rotate) {
          uv = uv.yx;
        }

        float igradient = clamp((1. - gradient) / 2., 0., 0.49999);
        float y = floor(uv.y * scale.y) / scale.y;
        float xd = (fract(sin(dot(vec2(y, 1. + y / 2.) + iseed / 120.795,vec2(127.1 + iseed/33., 311.7 +iseed/35.)))*(43758.5453 + iseed*101.3579)) - 0.5) * jitter;
        float xc = floor(mod(uv.x * scale.x + xd, scale.x)) / scale.x;
        float xn = floor(mod(uv.x * scale.x + 1. + xd, scale.x)) / scale.x;
        float xm = clamp(fract(uv.x * scale.x + xd) - igradient, 0., 1. - igradient * 2.) / (1. - igradient * 2.);

        vec2 c = fract(vec2(
          sin(dot(vec2(xc, y) + iseed, vec2(12.9898, 4.1414))),
          sin(dot(vec2(xn, y) + iseed, vec2(12.9898, 4.1414)))
        ) * 43758.5453);

        float n = mix(c.x, c.y, mix(xm, smoothstep(0., 1., xm), gradientSmoothness));

        return vec4(vec3(n), 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      source: 't',
      rotate: 'b',
      scale: '2f',
      gradient: 'f',
      gradientSmoothness: 'f',
      jitter: 'f'
    });
  }

  return program;
}

function anisotropicNoiseJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    rotate: parameters.rotate,
    scale: parameters.scale,
    gradient: parameters.gradient,
    gradientSmoothness: parameters.gradientSmoothness,
    jitter: parameters.jitter,
    seed: parameters.seed
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = anisotropicNoiseJob;
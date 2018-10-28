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

      uniform int scale;
      uniform float smoothness;
      uniform float remapping;

      float hash1( vec2 n, float seed) {
        return fract(sin(dot(n + seed / 120.795,vec2(127.1 + seed/33., 311.7 +seed/35.)))*(43758.5453 + seed*101.3579));
      }

      float bias (const in float b, const in float t) {
        return pow(t, log(b) / log(0.5));
      }

      vec2 gain (const in float g, const in vec2 t) {
        vec2 nt = t;

        if (t.x < 0.5) {
          nt.x = bias(1.-g, 2.*t.x) / 2.;
        } else {
          nt.x = 1. - bias(1.-g, 2. - 2. * t.x) / 2.;
        }

        if (t.y < 0.5) {
          nt.y = bias(1.-g, 2.*t.y) / 2.;
        } else {
          nt.y = 1. - bias(1.-g, 2. - 2. * t.y) / 2.;
        }

        return nt;
      }

      float controllableBilinearLerp (
        const in float p00,
        const in float p10,
        const in float p01,
        const in float p11,
        const in vec2 t,
        float smoothness
      ) {
        vec2 pt = mix(
          mix(
            t * t * t * t * (t * (t * (-20.0 * t + 70.0) - 84.0) + 35.0),
            t * t * t * (t * (t * 6. - 15.) + 10.),
            clamp(smoothness * 2., 0., 1.)
          ),
          smoothstep(0., 1., t),
          clamp(smoothness * 2. - 1., 0., 1.)
        );

        return mix(mix(p00, p10, pt.x), mix(p01, p11, pt.x), pt.y);
      }

      vec2 gradientNoiseDir(vec2 p, float scale, float seed)
      {
        float x = hash1(p, seed) * 2. - 1.;
        return normalize(vec2(x - floor(x + 0.5), abs(x) - 0.5));
      }

      float gradientNoise(in vec2 uv)
      {
        float iscale = float(scale) * 2.;
        float iseed = seed / 103.;
        uv = uv * iscale;

        vec2 p = floor(uv);
        vec2 f = fract(uv);

        float d00 = dot(gradientNoiseDir(mod(p, iscale), iscale, iseed), f);
        float d01 = dot(gradientNoiseDir(mod(p + vec2(0, 1), iscale), iscale, iseed), f - vec2(0, 1));
        float d10 = dot(gradientNoiseDir(mod(p + vec2(1, 0), iscale), iscale, iseed), f - vec2(1, 0));
        float d11 = dot(gradientNoiseDir(mod(p + vec2(1, 1), iscale), iscale, iseed), f - vec2(1, 1));

        float v = (1. + controllableBilinearLerp(d00, d10, d01, d11, f, smoothness)) * 0.5;

        return clamp((v - remapping) / (1. - remapping) * (1. + remapping * 2.), 0., 1.);
      }

      vec4 process (in vec2 uv) {
        return vec4(vec3(gradientNoise(uv)), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      scale: 'i',
      smoothness: 'f',
      seed: 'f',
      remapping: 'f'
    });
  }

  return program;
}

function gradientNoiseJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    scale: parameters.scale,
    smoothness: parameters.smoothness,
    seed: parameters.seed,
    remapping: parameters.remapping
  };

  console.log(outputs);
  program.execute(uniforms, outputs.output);

  done();
}

module.exports = gradientNoiseJob;
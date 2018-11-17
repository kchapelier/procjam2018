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
      uniform float deformShape;
      uniform float deformAmount;

      float hash1( vec2 n, float seed) {
        return fract(sin(dot(n + seed / 120.795,vec2(127.1 + seed/33., 311.7 +seed/35.)))*(43758.5453 + seed*101.3579));
      }

      vec2 hash2(vec2  p, float seed) {
        p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
        return fract(sin(p + seed) * (43758.5453 + seed));
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
            gain(0.95, t),
            t * t * t * (t * (t * 6. - 15.) + 10.),
            clamp(smoothness * 1.75 + 0.25, 0., 1.)
          ),
          smoothstep(0., 1., t),
          clamp(smoothness * 2. - 1., 0., 1.)
        );

        return mix(mix(p00, p10, pt.x), mix(p01, p11, pt.x), pt.y);
      }

      float valueNoise2d( in vec2 uv)
      {
        float iscale = float(scale) * 2.;
        float iseed = seed / 103.;
        uv = uv * iscale;
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        float p00 = hash1(mod(p, iscale), iseed);
        float p01 = hash1(mod(p + vec2(0., 1.), iscale), iseed);
        float p10 = hash1(mod(p + vec2(1., 0.), iscale), iseed);
        float p11 = hash1(mod(p + vec2(1., 1.), iscale), iseed);

        vec2 pd = hash2(mod(p + 0.5, iscale), iseed + p00);

        float d = clamp(pow(
          pow(pow(abs(f.x - 0.5) * 2., deformShape) + pow(abs(f.y - 0.5) * 2., deformShape), 1. / deformShape),
          deformAmount
        ), 0., 1.);

        return controllableBilinearLerp(p00, p10, p01, p11, mix(clamp(mix(f, pd, deformAmount), 0., 1.), f, d), smoothness);
      }

      vec4 process (in vec2 uv) {
        return vec4(vec3(valueNoise2d(uv)), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      scale: 'i',
      smoothness: 'f',
      seed: 'f',
      deformShape: 'f',
      deformAmount: 'f'
    });
  }

  return program;
}

function valueNoiseJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    scale: parameters.scale,
    smoothness: parameters.smoothness,
    seed: parameters.seed,
    deformShape: parameters.deformShape,
    deformAmount: parameters.deformAmount
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = valueNoiseJob;
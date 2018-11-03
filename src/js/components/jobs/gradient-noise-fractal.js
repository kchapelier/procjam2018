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

      uniform int minOctave;
      uniform int maxOctave;
      uniform int lacunarity;
      uniform int direction;
      uniform float smoothness;
      uniform float remapping;
      uniform float displacementAngle;
      uniform float displacementAmount;
      uniform float displacementSmoothing;
      uniform float weightReduction;
      uniform float peak;

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

      float gradientNoise(in vec2 uv, const in float scale, const in float seed)
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
        float uMin = float(min(minOctave, maxOctave));
        float uMax = float(max(minOctave, maxOctave));

        float f = 0.;
        float w = 0.;

        vec2 displacementDir = vec2(cos(displacementAngle),sin(displacementAngle));
        float ilacunarity = float(lacunarity);
        float iseed = seed / 103.3;
        float ipeak = mix(0., uMax, peak);

        for (float i = 0.; i <= 12.; i++) {
          float octave = direction > 0 ?  12. - i : i;

          if (octave >= uMin && octave <= uMax) {
            float weight = 1. / pow(1. / (1. - weightReduction), abs(octave - ipeak));

            f+= gradientNoise(uv - f * displacementAmount * displacementDir / mix(1., pow(ilacunarity, octave) / (uMin + 1.) * 2., displacementSmoothing), pow(ilacunarity, octave), iseed + octave) * weight;
            w+= weight;
          }
        }

        return vec4(vec3(f / w), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      minOctave: 'i',
      maxOctave: 'i',
      direction: 'i',
      lacunarity: 'i',
      smoothness: 'f',
      remapping: 'f',
      seed: 'f',
      displacementAngle: 'f',
      displacementAmount: 'f',
      displacementSmoothing: 'f',
      weightReduction: 'f',
      peak: 'f'
    });
  }

  return program;
}

function gradientNoiseFractalJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    minOctave: parameters.minOctave,
    maxOctave: parameters.maxOctave,
    lacunarity: parameters.lacunarity,
    direction: parameters.direction,
    smoothness: parameters.smoothness,
    remapping: parameters.remapping,
    seed: parameters.seed,
    displacementAngle: parameters.displacementAngle,
    displacementAmount: parameters.displacementAmount,
    displacementSmoothing: parameters.displacementSmoothing,
    weightReduction: parameters.weightReduction,
    peak: parameters.peak
  };

  console.log(outputs);
  program.execute(uniforms, outputs.output);

  done();
}

module.exports = gradientNoiseFractalJob;
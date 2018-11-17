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
      uniform float deformShape;
      uniform float deformAmount;
      uniform float displacementAngle;
      uniform float displacementAmount;
      uniform float displacementSmoothing;
      uniform float weightReduction;
      uniform float peak;

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

      float valueNoise2d( in vec2 uv, const in float scale, const in float seed)
      {
        uv = uv * scale * 2.;
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        float p00 = hash1(mod(p, scale * 2.), seed);
        float p01 = hash1(mod(p + vec2(0., 1.), scale * 2.), seed);
        float p10 = hash1(mod(p + vec2(1., 0.), scale * 2.), seed);
        float p11 = hash1(mod(p + vec2(1., 1.), scale * 2.), seed);
        vec2 pd = hash2(mod(p + vec2(0.5), scale * 2.), seed + p00);

        float d = clamp(pow(
          pow(pow(abs(f.x - 0.5) * 2., deformShape) + pow(abs(f.y - 0.5) * 2., deformShape), 1. / deformShape)
        , deformAmount), 0., 1.);

        return controllableBilinearLerp(p00, p10, p01, p11, mix(clamp(mix(f, pd, deformAmount), 0., 1.), f, d), smoothness);
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

            f+= valueNoise2d( uv - f * displacementAmount * displacementDir / mix(1., pow(ilacunarity, octave) / (uMin + 1.), displacementSmoothing), pow(ilacunarity, octave), iseed + octave) * weight;
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
      seed: 'f',
      deformShape: 'f',
      deformAmount: 'f',
      displacementAngle: 'f',
      displacementAmount: 'f',
      displacementSmoothing: 'f',
      weightReduction: 'f',
      peak: 'f'
    });
  }

  return program;
}

function valueNoiseFractalJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    minOctave: parameters.minOctave,
    maxOctave: parameters.maxOctave,
    lacunarity: parameters.lacunarity,
    direction: parameters.direction,
    smoothness: parameters.smoothness,
    seed: parameters.seed,
    deformShape: parameters.deformShape,
    deformAmount: parameters.deformAmount,
    displacementAngle: parameters.displacementAngle,
    displacementAmount: parameters.displacementAmount,
    displacementSmoothing: parameters.displacementSmoothing,
    weightReduction: parameters.weightReduction,
    peak: parameters.peak
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = valueNoiseFractalJob;
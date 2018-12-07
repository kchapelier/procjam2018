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
      uniform float remapping;
      uniform float displacementAngle;
      uniform float displacementAmount;
      uniform float displacementSmoothing;
      uniform float weightReduction;
      uniform float peak;

      uniform float randomTranslation;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float hash1( vec2 n, float seed) {
        return fract(sin(dot(n + seed / 120.795,vec2(127.1 + seed/33., 311.7 +seed/35.)))*(43758.5453 + seed*101.3579));
      }

      vec3 sampleTexture (in vec2 uv, const in float scale, const in float seed)
      {
        float iscale = float(scale);
        float iseed = seed / 103.;

        uv += vec2(hash1(vec2(scale*0.05, scale*0.1), seed) - 0.5, hash1(vec2(scale*0.1, scale*0.05), seed + 3.) - 0.5) * randomTranslation;

        uv = uv * iscale;

        vec3 v = texture(source, uv).rgb;

        return clamp((v - remapping) / (1. - remapping) * (1. + remapping * 2.), 0., 1.);
      }

      vec4 process (in vec2 uv) {
        float uMin = float(min(minOctave, maxOctave));
        float uMax = float(max(minOctave, maxOctave));

        vec3 f = vec3(0.);
        float w = 0.;

        vec2 displacementDir = vec2(cos(displacementAngle),sin(displacementAngle));
        float ilacunarity = float(lacunarity);
        float iseed = seed / 103.3;
        float ipeak = mix(0., uMax, peak);

        for (float i = 0.; i <= 12.; i++) {
          float octave = direction > 0 ?  12. - i : i;

          if (octave >= uMin && octave <= uMax) {
            float weight = 1. / pow(1. / (1. - weightReduction), abs(octave - ipeak));
            float displacementRef = (f.r + f.g + f.b) / 3.;

            f+= sampleTexture(uv - displacementRef * displacementAmount * displacementDir / mix(1., pow(ilacunarity, octave) / (uMin + 1.) * 2., displacementSmoothing), pow(ilacunarity, octave), iseed + octave) * weight;
            w+= weight;
          }
        }

        return vec4(f / w, 1.);
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
      minOctave: 'i',
      maxOctave: 'i',
      direction: 'i',
      lacunarity: 'i',
      remapping: 'f',
      seed: 'f',
      displacementAngle: 'f',
      displacementAmount: 'f',
      displacementSmoothing: 'f',
      weightReduction: 'f',
      peak: 'f',
      randomTranslation: 'f'
    });
  }

  return program;
}

function octaveSumJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    minOctave: parameters.minOctave,
    maxOctave: parameters.maxOctave,
    lacunarity: parameters.lacunarity,
    direction: parameters.direction,
    remapping: parameters.remapping,
    seed: parameters.seed,
    displacementAngle: parameters.displacementAngle,
    displacementAmount: parameters.displacementAmount,
    displacementSmoothing: parameters.displacementSmoothing,
    weightReduction: parameters.weightReduction,
    peak: parameters.peak,
    randomTranslation: parameters.randomTranslation
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = octaveSumJob;
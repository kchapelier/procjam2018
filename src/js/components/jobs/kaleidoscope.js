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

      #define PI   3.1415926535898

      uniform vec2 resolution;
      uniform float seed;

      const float rotationMode = 0.;
      uniform float kaleid1;
      uniform float kaleid2;
      uniform float kaleid2Position;
      uniform vec2 stretch;
      uniform float distortionAmount;

      uniform float lensEffect1Power;
      uniform float lensEffect1Amount;
      uniform float lensEffect1MidPoint;
      uniform float lensEffect2Power;
      uniform float lensEffect2Amount;
      uniform float lensEffect2MidPoint;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D distortion;
      uniform bool distortionSet;
      uniform vec2 distortionSize;

      // adapted from hg_sdf http://mercury.sexy/hg_sdf/
      // https://gist.github.com/kchapelier/30e53bba73c04640b259
      float pModPolar(inout vec2 p, const float repetitions, const float rotation) {
        float angle = 2. * PI/repetitions;
        float a = atan(p.y, p.x) + angle/2. + rotation;
        float r = length(p);
        float c = floor(a/angle);
        a = mod(a,angle) - angle/2.;
        p = vec2(cos(a), sin(a))*r;
        // For an odd number of repetitions, fix cell index of the cell in -x direction
        // (cell index would be e.g. -5 and 5 in the two halves of the cell):
        if (abs(c) >= (repetitions/2.)) c = abs(c);
        return c;
      }

      float getDistorsionLevel (const in vec2 ouv, const in vec2 uv) {
        vec3 color = vec3(0.);

        if (distortionSet == true) {
          color = texture(distortion, ouv).rgb;
        } else {
          color = texture(source, uv).rgb;
        }

        return (clamp(color.r, 0., 1.) + clamp(color.g, 0., 1.) + clamp(color.b, 0., 1.)) / 3.;
      }

      vec2 remapUv (in vec2 uv) {
          vec2 ouv = uv;
          float lengthUv = distance(ouv, vec2(0.5)) * 2.;

          uv = (0.5-uv);
          pModPolar(uv, kaleid1, rotationMode * PI / kaleid1);
          uv = abs(mod(uv * stretch * (1. + lensEffect1Amount * pow(clamp(abs(lensEffect1MidPoint - lengthUv * 2.), 0., 2.), lensEffect1Power)), 2.) - 1.);

          float dist = getDistorsionLevel(ouv, uv) * distortionAmount;

          pModPolar(uv, kaleid2 + dist, kaleid2Position - lensEffect2Amount * pow(clamp(abs(lensEffect2MidPoint - lengthUv * 2.), 0., 2.), lensEffect2Power));

          // mirror effect instead of clamped lines for uv < 0 and > 1
          //uv = abs(1. - abs(uv)); //previous version which doesnt support uv > 2 ou < -1
          uv = abs(mod(uv, 2.) - 1.);
          return uv;
      }

      vec4 process (in vec2 uv) {
        return texture(source, remapUv(uv));
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
      distortion: 't',

      kaleid1: 'f',
      kaleid2: 'f',
      kaleid2Position: 'f',
      stretch: '2f',
      distortionAmount: 'f',

      lensEffect1Power: 'f',
      lensEffect1Amount: 'f',
      lensEffect1MidPoint: 'f',
      lensEffect2Power: 'f',
      lensEffect2Amount: 'f',
      lensEffect2MidPoint: 'f'
    });
  }

  return program;
}

function kaleidoscopeJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    distortion: inputs.distortion,
    kaleid1: parameters.kaleid1,
    kaleid2: parameters.kaleid2,
    kaleid2Position: parameters.kaleid2Position,
    stretch: parameters.stretch,
    distortionAmount: parameters.distortionAmount,
    lensEffect1Power: parameters.lensEffect1Power,
    lensEffect1Amount: parameters.lensEffect1Amount,
    lensEffect1MidPoint: parameters.lensEffect1MidPoint,
    lensEffect2Power: parameters.lensEffect2Power,
    lensEffect2Amount: parameters.lensEffect2Amount,
    lensEffect2MidPoint: parameters.lensEffect2MidPoint
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = kaleidoscopeJob;
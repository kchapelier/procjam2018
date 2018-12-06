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

      uniform float threshold;
      uniform vec3 channelWeights;
      uniform float iterations;
      uniform float parabolaFactor;
      uniform float dist;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float getDistance (const in vec3 base, const in vec3 comp) {
        float sumWeights = max(
          0.000001,
          channelWeights.r + channelWeights.g + channelWeights.b
        );

        float dist = abs(base.r - comp.r) * channelWeights.r;
        dist+= abs(base.g - comp.g) * channelWeights.g;
        dist+= abs(base.b - comp.b) * channelWeights.b;

        return clamp(pow(dist / sumWeights, .5), 0. , 1.);
      }

      vec3 _process (const in vec3 base, const in vec2 uv, const in float value, inout float sum) {
        float ithreshold = threshold * (1. - 0.00001);
        vec3 col = texture(source, uv).rgb;
        float weight = clamp(1. - getDistance(base, col) - threshold, 0., 1.) / (1. - threshold);
        sum += value * weight;
        return col * value * weight;
      }

      vec4 process (const in vec2 uv) {
        vec3 base = texture(source, uv).rgb;
        vec3 col = vec3(0.);
        float sum = 0.;

        float distMultiplier = 1. / 512. * dist / iterations;
        float k;
        float wx;
        float wy;

        for (float x = -iterations; x <= iterations; x++) {
          k = (x + iterations) / (iterations * 2. + 0.00001);
          wx = pow(4.0 * k * (1. - k), parabolaFactor); // inlined _parabola()
          for (float y = -iterations; y <= iterations; y++) {
            if (x != 0. && y != 0.) {
              k = (y + iterations) / (iterations * 2. + 0.00001);
              wy = pow(4.0 * k * (1. - k), parabolaFactor); // inlined _parabola()
              col+= _process(base, uv + vec2(x, y) * vec2(1., 1.) * distMultiplier, wx * wy, sum);
            }
          }
        }

        if (sum < 1.) {
          col += base * (1. - sum);
        } else {
          col = col / sum;
        }

        return vec4(col, 1.);
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
      iterations: 'f',
      threshold: 'f',
      channelWeights: '3f',
      dist: 'f',
      parabolaFactor: 'f',
      source: 't'
    });
  }

  return program;
}

function selectiveBlurJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    iterations: parameters.iterations,
    threshold: parameters.threshold,
    channelWeights: parameters.channelWeights,
    dist: parameters.dist,
    parabolaFactor: parameters.parabolaFactor
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = selectiveBlurJob;
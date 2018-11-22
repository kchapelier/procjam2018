"use strict";

var globalEE = require('./../event-emitter').global;

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
      uniform float iterations;
      uniform float parabolaFactor;
      uniform vec2 passMultiplier;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution;

        float dist = length(resolution) / iterations * intensity;

        vec2 dir = passMultiplier * dist / 100.;

        vec3 sum = vec3(0.);
        float sumWeights = 0.;
        float k = 0.;
        float w = 0.;

        float iterationRatioMax = iterations * 2. + 0.00001;

        for (float t = -iterations; t <= iterations; t++) {
            k = (t + iterations) / iterationRatioMax;
            w = pow(4.0 * k * (1. - k), parabolaFactor); // inlined _parabola()
            sum += texture(source, uv + p * dir * t).rgb * w;
            sumWeights += w;
        }

        sum = sum * 2. - sumWeights; // normal unpacking done outside of the loop for perf

        vec3 n = normalize(clamp(sum / sumWeights, -1., 1.)) * 0.5 + 0.5;

        return vec4(n, 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;

        if (sourceSet == true) {
          fragColor = process(uv);
        } else {
          fragColor = vec4(0.5, 0.5, 1., 1.);
        }
      }

    `, {
      source: 't',
      intensity: 'f',
      iterations: 'f',
      parabolaFactor: 'f',
      passMultiplier: '2f'
    });
  }

  return program;
}

var buffers = null;

function getBuffers (callback) {
  if (buffers === null) {
    globalEE.trigger('create-buffers', 1, true, function (requestedBuffers) {
      buffers = requestedBuffers;
      callback(buffers);
    });
  } else {
    callback(buffers);
  }
}

function sharpenJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var uniforms = {
    source: null,
    passMultiplier: null,
    intensity: parameters.intensity,
    iterations: parameters.iterations,
    parabolaFactor: parameters.parabolaFactor
  };

  getBuffers(function (buffers) {
    var source = inputs.input;

    uniforms.source = source;
    uniforms.passMultiplier = [1., 0.];
    program.execute(uniforms, buffers[0]);
    source = buffers[0];

    uniforms.source = source;
    uniforms.passMultiplier = [0., 1.];
    program.execute(uniforms, outputs.output);

    done();
  });
}

module.exports = sharpenJob;
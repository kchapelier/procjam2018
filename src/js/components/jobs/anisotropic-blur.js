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

      uniform float angle;
      uniform float anisotropy;
      uniform float intensity;
      uniform float iterations;
      uniform vec2 multiplier;
      uniform float parabolaFactor;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec2 rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution;

        vec4 base = vec4(0.);
        float sum = 0.;
        float w = 0.;
        float k = 0.;

        float dist = resolution.y / iterations * intensity;

        p*= vec2(1. + anisotropy * 0.99, 1. - anisotropy * 0.99) * dist;

        for (float x = -iterations; x <= iterations; x++) {
            k = (x + iterations) / (iterations * 2. + 0.00001);
            w = pow(4.0*k*(1.-k), parabolaFactor); //_parabola(k);

            base += texture(source, uv + rotate(multiplier * p * x, -angle)) * w;
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
      anisotropy: 'f',
      intensity: 'f',
      iterations: 'f',
      parabolaFactor: 'f',
      multiplier: '2f'
    });
  }

  return program;
}

var buffers = null;

function getBuffers (callback) {
  if (buffers === null) {
    globalEE.trigger('create-buffers', 2, true, function (requestedBuffers) {
      buffers = requestedBuffers;
      callback(buffers);
    });
  } else {
    callback(buffers);
  }
}

function anisotropicBlurJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    angle: parameters.angle,
    anisotropy: parameters.anisotropy,
    intensity: parameters.intensity,
    iterations: 20,
    parabolaFactor: parameters.parabolaFactor
  };

  getBuffers(function (buffers) {
    var source = inputs.input;

    uniforms.multiplier = [1, 0];
    uniforms.source = source;
    program.execute(uniforms, buffers[0]);
    source = buffers[0];

    uniforms.multiplier = [0, 1];
    uniforms.source = source;
    program.execute(uniforms, buffers[1]);
    source = buffers[1];

    uniforms.multiplier = [0.33, 0];
    uniforms.source = source;
    program.execute(uniforms, buffers[0]);
    source = buffers[0];

    uniforms.multiplier = [0, 0.33];
    uniforms.source = source;
    program.execute(uniforms, outputs.output);

    done();
  });
}

module.exports = anisotropicBlurJob;
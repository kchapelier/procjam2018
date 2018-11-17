"use strict";

var getTruncateKernelForLinearFilter = require('./../../commons/gaussian-kernels').getTruncateKernelForLinearFilter;
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

      uniform float weight0;
      uniform float weight1;
      uniform float weight2;
      uniform float weight3;
      uniform float weight4;
      uniform float weight5;
      uniform float weight6;
      uniform float weight7;
      uniform float weight8;
      uniform float weight9;
      uniform float weight10;
      uniform float weight11;
      uniform float weight12;
      uniform float weight13;
      uniform float weight14;
      uniform float weight15;
      uniform float offset0;
      uniform float offset1;
      uniform float offset2;
      uniform float offset3;
      uniform float offset4;
      uniform float offset5;
      uniform float offset6;
      uniform float offset7;
      uniform float offset8;
      uniform float offset9;
      uniform float offset10;
      uniform float offset11;
      uniform float offset12;
      uniform float offset13;
      uniform float offset14;
      uniform float offset15;
      uniform vec2 passMultiplier;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution;

        float weights[16];
        weights[0] = weight0;
        weights[1] = weight1;
        weights[2] = weight2;
        weights[3] = weight3;
        weights[4] = weight4;
        weights[5] = weight5;
        weights[6] = weight6;
        weights[7] = weight7;
        weights[8] = weight8;
        weights[9] = weight9;
        weights[10] = weight10;
        weights[11] = weight11;
        weights[12] = weight12;
        weights[13] = weight13;
        weights[14] = weight14;
        weights[15] = weight15;

        float offsets[16];
        offsets[0] = offset0;
        offsets[1] = offset1;
        offsets[2] = offset2;
        offsets[3] = offset3;
        offsets[4] = offset4;
        offsets[5] = offset5;
        offsets[6] = offset6;
        offsets[7] = offset7;
        offsets[8] = offset8;
        offsets[9] = offset9;
        offsets[10] = offset10;
        offsets[11] = offset11;
        offsets[12] = offset12;
        offsets[13] = offset13;
        offsets[14] = offset14;
        offsets[15] = offset15;

        vec3 sum = texture(source, uv).rgb * weights[0];
        float sumWeights = weights[0];

        for (int i = 1; i < 16; i++) {
          sum += (
            texture(source, uv + p * passMultiplier * offsets[i]).rgb +
            texture(source, uv - p * passMultiplier * offsets[i]).rgb
          ) * weights[i];
          sumWeights += weights[i] * 2.;
        }

        return vec4(sum / sumWeights, 1.);
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
      weight0: 'f',
      weight1: 'f',
      weight2: 'f',
      weight3: 'f',
      weight4: 'f',
      weight5: 'f',
      weight6: 'f',
      weight7: 'f',
      weight8: 'f',
      weight9: 'f',
      weight10: 'f',
      weight11: 'f',
      weight12: 'f',
      weight13: 'f',
      weight14: 'f',
      weight15: 'f',
      offset0: 'f',
      offset1: 'f',
      offset2: 'f',
      offset3: 'f',
      offset4: 'f',
      offset5: 'f',
      offset6: 'f',
      offset7: 'f',
      offset8: 'f',
      offset9: 'f',
      offset10: 'f',
      offset11: 'f',
      offset12: 'f',
      offset13: 'f',
      offset14: 'f',
      offset15: 'f',
      passMultiplier: '2f'
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

function sharpenJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var kernel = getTruncateKernelForLinearFilter(parameters.kernelSize, parameters.sigma);

  var uniforms = {
    source: null,
    passMultiplier: null
  };

  for (var i = 0; i < 16; i++) {
    if (i >= kernel.weights.length) {
      uniforms['weight' + i.toString()] = 0;
      uniforms['offset' + i.toString()] = 0;
    } else {
      uniforms['weight' + i.toString()] = kernel.weights[i];
      uniforms['offset' + i.toString()] = kernel.offsets[i];
    }
  }

  getBuffers(function (buffers) {
    var source = inputs.input;

    for (var i = 0; i < parameters.iterations - 1; i++) {
      uniforms.source = source;
      uniforms.passMultiplier = [1., 0.];
      program.execute(uniforms, buffers[0]);
      source = buffers[0];

      uniforms.source = source;
      uniforms.passMultiplier = [0., 1.];
      program.execute(uniforms, buffers[1]);
      source = buffers[1];
    }

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
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

      uniform int channel1Source;
      uniform bool channel1Invert;
      uniform int channel2Source;
      uniform bool channel2Invert;
      uniform int channel3Source;
      uniform bool channel3Invert;

      uniform sampler2D input1;
      uniform bool input1Set;
      uniform vec2 input1Size;

      uniform sampler2D input2;
      uniform bool input2Set;
      uniform vec2 input2Size;

      uniform sampler2D input3;
      uniform bool input3Set;
      uniform vec2 input3Size;

      float getColor(int source, bool invert, vec2 uv) {
        float color = 0.;
        vec4 textureSample = vec4(0.);

        int sourceSampler = source / 3;
        int sourceChannel = int(mod(float(source), 3.));

        if (sourceSampler == 2) {
            textureSample = input3Set == true ? texture(input3, uv) : vec4(0.);
        } else if (sourceSampler == 1) {
            textureSample = input2Set == true ? texture(input2, uv) : vec4(0.);
        } else {
            textureSample = input1Set == true ? texture(input1, uv) : vec4(0.);
        }

        if (sourceChannel == 2) {
            color = textureSample.b;
        } else if (sourceChannel == 1) {
            color = textureSample.g;
        } else {
            color = textureSample.r;
        }

        if (invert) {
            color = 1. - color;
        }

        return color;
      }

      vec4 process (in vec2 uv) {
        return vec4(
          getColor(channel1Source, channel1Invert, uv),
          getColor(channel2Source, channel2Invert, uv),
          getColor(channel3Source, channel3Invert, uv),
          1.
        );
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      input1: 't',
      input2: 't',
      input3: 't',
      channel1Source: 'i',
      channel1Invert: 'b',
      channel2Source: 'i',
      channel2Invert: 'b',
      channel3Source: 'i',
      channel3Invert: 'b'
    });
  }

  return program;
}

function channelShuffleJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    input1: inputs.input1,
    input2: inputs.input2,
    input3: inputs.input3,

    channel1Source: parameters.channel1Source,
    channel1Invert: parameters.channel1Invert,
    channel2Source: parameters.channel2Source,
    channel2Invert: parameters.channel2Invert,
    channel3Source: parameters.channel3Source,
    channel3Invert: parameters.channel3Invert
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = channelShuffleJob;
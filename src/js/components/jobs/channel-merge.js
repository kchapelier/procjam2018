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

      uniform sampler2D channel1;
      uniform bool channel1Set;
      uniform vec2 channel1Size;

      uniform sampler2D channel2;
      uniform bool channel2Set;
      uniform vec2 channel2Size;

      uniform sampler2D channel3;
      uniform bool channel3Set;
      uniform vec2 channel3Size;

      vec4 process (in vec2 uv) {
        vec4 channel1rgb = channel1Set == true ? texture(channel1, uv) : vec4(0.);
        vec4 channel2rgb = channel2Set == true ? texture(channel2, uv) : vec4(0.);
        vec4 channel3rgb = channel3Set == true ? texture(channel3, uv) : vec4(0.);

        return vec4(
          (channel1rgb.r + channel1rgb.g + channel1rgb.b) / 3.,
          (channel2rgb.r + channel2rgb.g + channel2rgb.b) / 3.,
          (channel3rgb.r + channel3rgb.g + channel3rgb.b) / 3.,
          1.
        );
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      channel1: 't',
      channel2: 't',
      channel3: 't'
    });
  }

  return program;
}

function channelSplitterJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  program.execute({ channel1: inputs.channel1, channel2: inputs.channel2, channel3: inputs.channel3 }, outputs.output);

  done();
}

module.exports = channelSplitterJob;
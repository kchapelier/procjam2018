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

      uniform vec3 multiplier;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec3 base = texture(source, uv).rgb * multiplier;

        return vec4(vec3(length(base)), 1.);
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
      multiplier: '3f',
      source: 't'
    });
  }

  return program;
}

function channelSplitterJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  program.execute({ source: inputs.input, multiplier: [1, 0, 0] }, outputs.channel1);
  program.execute({ source: inputs.input, multiplier: [0, 1, 0] }, outputs.channel2);
  program.execute({ source: inputs.input, multiplier: [0, 0, 1] }, outputs.channel3);

  done();
}

module.exports = channelSplitterJob;
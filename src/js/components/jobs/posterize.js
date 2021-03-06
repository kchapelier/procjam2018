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

      uniform int levels;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec3 base = texture(source, uv).rgb;

        return vec4(clamp(floor(base * float(levels)) / (float(levels) - 1.), 0., 1.), 1.);
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
      levels: 'i',
      source: 't'
    });
  }

  return program;
}

function posterizeJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    levels: parameters.levels
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = posterizeJob;
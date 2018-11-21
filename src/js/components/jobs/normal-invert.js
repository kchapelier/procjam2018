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

      uniform bool flipY;
      uniform bool flipX;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec3 n = (texture(source, uv).rgb - 0.5) * 2.;

        if (flipY) n.g = -n.g;
        if (flipX) n.r = -n.r;

        return vec4(normalize(n) * 0.5 + 0.5, 1.);
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
      flipY: 'f',
      flipX: 'f'
    });
  }

  return program;
}

function normalInvertJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    flipX: parameters.flipX,
    flipY: parameters.flipY
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = normalInvertJob;
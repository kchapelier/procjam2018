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

      const int MODE_AXIS_X = 0;
      const int MODE_AXIS_Y = 1;
      const int MODE_CORNER = 2;

      uniform vec2 resolution;
      uniform float seed;

      uniform int mode;
      uniform float translateAxisX;
      uniform float translateAxisY;
      uniform bool invertAxisX;
      uniform bool invertAxisY;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        if (mode == MODE_AXIS_X) {
          uv.y = abs(.5 - abs(uv.y - .5)) * (invertAxisY ? -1. : 1.) + translateAxisY;
        } else if (mode == MODE_AXIS_Y) {
          uv.x = abs(.5 - abs(uv.x - .5)) * (invertAxisX ? 1. : -1.) + translateAxisX;
        } else if (mode == MODE_CORNER) {
            uv.x = abs(.5 - abs(uv.x - .5)) * (invertAxisX ? -1. : 1.) + translateAxisX;
            uv.y = abs(.5 - abs(uv.y - .5)) * (invertAxisY ? 1. : -1.) + translateAxisY;
        }

        return texture(source, uv);
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
      mode: 'i',
      source: 't',
      translateAxisX: 'f',
      translateAxisY: 'f',
      invertAxisX: 'f',
      invertAxisY: 'f'
    });
  }

  return program;
}

function mirrorJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    mode: parameters.mode,
    translateAxisX: parameters.translateAxisX,
    translateAxisY: parameters.translateAxisY,
    invertAxisX: parameters.invertAxisX,
    invertAxisY: parameters.invertAxisY
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = mirrorJob;
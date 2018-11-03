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

      const int TYPE_HORIZONTAL = 0;
      const int TYPE_VERTICAL = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform float skew;
      uniform float center;
      uniform int orientation;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        if (orientation == TYPE_HORIZONTAL) {
          uv.x += (1. - center - uv.y) * skew;
        } else {
          uv.y += (center - uv.x) * skew;
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
      source: 't',
      skew: 'f',
      center: 'f',
      orientation: 'i'
    });
  }

  return program;
}

function skewJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    skew: parameters.skew,
    center: parameters.center,
    orientation: parameters.orientation,
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = skewJob;
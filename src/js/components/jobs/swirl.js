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

      uniform float outerAngle;
      uniform float innerAngle;
      uniform float power;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec2 _rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        uv -= 0.5;

        float l = length(uv) / 0.70710678119;

        float a = mix(innerAngle, outerAngle, pow(l, power));

        uv = _rotate(uv, a) - 0.5;

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
      outerAngle: 'f',
      innerAngle: 'f',
      power: 'f'
    });
  }

  return program;
}

function swirlJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    outerAngle: parameters.outerAngle,
    innerAngle: parameters.innerAngle,
    power: parameters.power
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = swirlJob;
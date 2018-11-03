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

      const float _PI = 3.141592653589793;

      uniform vec2 resolution;
      uniform float seed;

      uniform vec2 translate;
      uniform float rotation;
      uniform bool repeatSafe;
      uniform vec2 scale;

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
        vec2 iscale = repeatSafe == true ? floor(scale) : scale;

        uv = (uv + translate) * iscale;

        uv = uv - 0.5 * iscale;

        if (repeatSafe == true) {
            float irotate = mod(floor(rotation / (_PI * 2.) * 8.), 8.);
            uv = _rotate(uv, _PI / 4. * irotate) * (1. + mod(irotate, 2.) * .4142135623730951);
        } else {
            uv = _rotate(uv, rotation);
        }

        uv = uv + 0.5 * iscale;

        vec4 base = texture(source, uv);

        return vec4(base.rgb, 1.);
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
      translate: '2f',
      repeatSafe: 'b',
      rotation: 'f',
      scale: '2f'
    });
  }

  return program;
}

function transform2dJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    translate: parameters.translate,
    repeatSafe: parameters.repeatSafe,
    rotation: parameters.rotation,
    scale: parameters.scale
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = transform2dJob;
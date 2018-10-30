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

      uniform float sharpen;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv) * (1. + 5. * sharpen);
        vec2 pixSize = 1. / resolution;

        base -= texture(source, uv + vec2(1., 0.) * pixSize) * sharpen;
        base -= texture(source, uv + vec2(0., 1.) * pixSize) * sharpen;
        base -= texture(source, uv - vec2(1., 0.) * pixSize) * sharpen;
        base -= texture(source, uv - vec2(0., 1.) * pixSize) * sharpen;

        base -= texture(source, uv + vec2(1., 1.) * pixSize * 0.707) * sharpen / 4.;
        base -= texture(source, uv - vec2(1., 1.) * pixSize * 0.707) * sharpen / 4.;
        base -= texture(source, uv + vec2(1., -1.) * pixSize * 0.707) * sharpen / 4.;
        base -= texture(source, uv + vec2(-1., 1.) * pixSize * 0.707) * sharpen / 4.;

        return base;
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
      sharpen: 'f',
      source: 't'
    });
  }

  return program;
}

function sharpenJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    sharpen: parameters.sharpen
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = sharpenJob;
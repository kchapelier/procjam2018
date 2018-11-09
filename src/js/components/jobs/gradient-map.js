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

      const float eps = 0.0000001;

      uniform vec2 resolution;
      uniform float seed;

      uniform vec2 startGradient;
      uniform vec2 endGradient;
      uniform bool invert;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D gradientMap;
      uniform bool gradientMapSet;
      uniform vec2 gradientMapSize;

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv);
        float gray = (base.r + base.g + base.b) / 3.;

        if (invert == true) {
            gray = 1. - gray;
        }

        vec2 p = 1. / resolution;

        // prevents against color bleeding from linear sampling at the edges of the gradient map
        vec2 istartGradient = clamp(startGradient, p / 2., vec2(1.) - p / 2.);
        vec2 iendGradient = clamp(endGradient, p / 2., vec2(1.) - p / 2.);

        vec2 guv = mix(istartGradient, iendGradient, gray);

        return vec4(vec3(texture(gradientMap, guv)), 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;

        if (sourceSet == true && gradientMapSet == true) {
          fragColor = process(uv);
        } else {
          fragColor = vec4(0., 0., 0., 1.);
        }
      }

    `, {
      gradientMap: 't',
      source: 't',
      startGradient: '2f',
      endGradient: '2f',
      invert: 'b'
    });
  }

  return program;
}

function gradientMapJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var startGradient, endGradient;

  var position = parameters.position;

  if (parameters.orientation === 0) {
    startGradient = [0., position];
    endGradient = [1., position];
  } else {
    startGradient = [position, 0.];
    endGradient = [position, 1.];
  }

  var uniforms = {
    source: inputs.input,
    gradientMap: inputs.gradient,
    startGradient: startGradient,
    endGradient: endGradient,
    invert: parameters.invert
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = gradientMapJob;
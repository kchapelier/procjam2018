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

      uniform float angle;
      uniform float depth;
      uniform float height;
      uniform float range;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float remap (float v, float height, float depth) {
        v = v * depth + height;
        return clamp(v, 0., 1.);
      }

      vec4 process (in vec2 uv) {
        vec2 o = vec2(-cos(angle), -sin(angle));
        vec3 base = vec3(0.);

        for(float i = 0.; i < 20.; i++) {
          base += (
            texture(source, uv + (1. + (range - 1.) * i / 19.) * o / resolution).rgb -
            texture(source, uv - (1. + (range - 1.) * i / 19.) * o / resolution).rgb
          );
        }

        base = base / 20.;

        return vec4(vec3(
            remap(base.r, height, depth),
            remap(base.g, height, depth),
            remap(base.b, height, depth)
        ), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;

          if (sourceSet == true) {
            fragColor = process(uv);
          } else {
            fragColor = vec4(vec3(height), 1.);
          }
      }

    `, {
      angle: 'f',
      depth: 'f',
      height: 'f',
      range: 'f',
      source: 't'
    });
  }

  return program;
}

function embossJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    angle: parameters.angle,
    depth: parameters.depth,
    height: parameters.height,
    range: parameters.range
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = embossJob;
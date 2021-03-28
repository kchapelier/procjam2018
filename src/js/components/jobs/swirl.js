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

      uniform float innerAngle;
      uniform float smoothness;
      uniform float power;
      uniform float innerRadius;
      uniform float radius;
      uniform float centerX;
      uniform float centerY;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      const float eps = 0.0000001;

      vec2 _rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        vec2 offset = vec2(centerX, -centerY) * 0.5 + vec2(0.5);

        uv -= offset;

        float l = clamp((length(uv) / 0.5 - innerRadius) / radius, 0., 1.);

        l = mix(l, smoothstep(0., 1., l), smoothness);

        float a = mix(innerAngle, 0., pow(l, max(power, eps)));

        uv = _rotate(uv, a) + offset;

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
      innerAngle: 'f',
      smoothness: 'f',
      power: 'f',
      innerRadius: 'f',
      radius: 'f',
      centerX: 'f',
      centerY: 'f'
    });
  }

  return program;
}

function swirlJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    innerAngle: parameters.innerAngle,
    smoothness: parameters.smoothness,
    power: parameters.power,
    innerRadius: parameters.innerRadius,
    radius: parameters.radius,
    centerX: parameters.centerX,
    centerY: parameters.centerY
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = swirlJob;
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

      const int TYPE_SMOOTH = 1;
      const int TYPE_STANDARD = 0;

      uniform vec2 resolution;
      uniform float seed;

      uniform int type;
      uniform float brightness;
      uniform float contrast;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec4 color = texture(source, uv);

        if (type == TYPE_SMOOTH) {
          //apply contrast

          // very arbitrary mapping from [-1,1] to [0. (0**(1+0)), 3. (2**(1+0.5849625007))]
          float icontrast = pow(contrast + 1., 1.0 + 0.5849625007 * pow((contrast + 1.) / 2., 4.));

          color.rgb = (color.rgb - 0.5) * icontrast + 0.5;

          //apply brightness
          float midPoint = 0.5 + brightness / 4.0;
          float range = min(abs(midPoint), abs(1. - midPoint));

          color.rgb = mix(vec3(midPoint - range), vec3(midPoint + range), color.rgb);
        } else {
          color.rgb = (color.rgb - 0.5) * (contrast + 1.) + brightness + 0.5;
        }

        color.rgb = clamp(color.rgb, 0., 1.);

        return color;
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
      type: 'i',
      brightness: 'f',
      contrast: 'f'
    });
  }

  return program;
}

function brightnessContrastJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    type: parameters.type,
    brightness: parameters.brightness,
    contrast: parameters.contrast
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = brightnessContrastJob;
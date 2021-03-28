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

      const int TYPE_RGB = 0;
      const int TYPE_HSL = 1;
      const int TYPE_HUE = 2;
      const int TYPE_SATURATION = 3;
      const int TYPE_LUMINOSITY = 4;

      uniform vec2 resolution;
      uniform float seed;

      uniform vec3 color;
      uniform int type;
      uniform float range;
      uniform float softness;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;


      const float eps = 0.0000001;

      // https://gist.github.com/yiwenl/745bfea7f04c456e0101 (much better than previous implementation)
      vec3 _rgb2hsl(vec3 color) {
        vec3 hsl = vec3(0.);
        float fmin = min(min(color.r, color.g), color.b); //Min. value of RGB
        float fmax = max(max(color.r, color.g), color.b); //Max. value of RGB
        float delta = fmax - fmin; //Delta RGB value
        hsl.z = (fmax + fmin) / 2.0; // Luminance
        if (delta == 0.0) //This is a gray, no chroma...
        {
          hsl.x = 0.0; // Hue
          hsl.y = 0.0; // Saturation
        } else //Chromatic data...
        {
          if (hsl.z < 0.5)
            hsl.y = delta / (fmax + fmin); // Saturation
          else
            hsl.y = delta / (2.0 - fmax - fmin); // Saturation
          float deltaR = (((fmax - color.r) / 6.0) + (delta / 2.0)) / delta;
          float deltaG = (((fmax - color.g) / 6.0) + (delta / 2.0)) / delta;
          float deltaB = (((fmax - color.b) / 6.0) + (delta / 2.0)) / delta;
          if (color.r == fmax)
            hsl.x = deltaB - deltaG; // Hue
          else if (color.g == fmax)
            hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
          else if (color.b == fmax)
            hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue
          if (hsl.x < 0.0)
            hsl.x += 1.0; // Hue
          else if (hsl.x > 1.0)
            hsl.x -= 1.0; // Hue
        }
        return hsl;
      }

      vec4 process (in vec2 uv) {
        vec3 base = texture(source, uv).rgb;
        vec3 target = color / 255.;

        if (type == TYPE_HSL) {
          base = _rgb2hsl(base);
          target = _rgb2hsl(target);
        } else if (type == TYPE_HUE) {
          base = _rgb2hsl(base).rrr;
          target = _rgb2hsl(target).rrr;
        } else if (type == TYPE_SATURATION) {
          base = _rgb2hsl(base).ggg;
          target = _rgb2hsl(target).ggg;
        } else if (type == TYPE_LUMINOSITY) {
          base = _rgb2hsl(base).bbb;
          target = _rgb2hsl(target).bbb;
        }

        float d = distance(base, target) / range / 1.7320508;
        float g = clamp((1. - d) * (1. + 200. * (1. - pow(softness, 0.025))), 0., 1.);

        return vec4(vec3(smoothstep(0., 1., g)), 1.);
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
      color: '3f',
      range: 'f',
      softness: 'f',
      type: 'i'
    });
  }

  return program;
}

function colorToMaskJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    color: parameters.color,
    range: parameters.range,
    softness: parameters.softness,
    type: parameters.type
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = colorToMaskJob;
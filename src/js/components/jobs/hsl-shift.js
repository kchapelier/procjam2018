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

      uniform float hueShift;
      uniform float hueAttenuation;
      uniform float saturationShift;
      uniform float luminosityShift;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      const float eps = 0.0000001;

      vec3 _hsl2rgb (in vec3 c) {
        vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
      }

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
        vec3 color = texture(source, uv).rgb;

        color = _rgb2hsl(color);

        color.r = color.r * (1. - hueAttenuation) + hueAttenuation / 2. + hueShift + 1.;
        color.g = clamp(color.g + pow(saturationShift, 2.) * sign(saturationShift), 0., 1.);
        color.b = clamp(color.b + pow(luminosityShift, 2.) * sign(luminosityShift), 0., 1.);
        color = _hsl2rgb(color);

        return vec4(color, 1.);
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
      hueShift: 'f',
      hueAttenuation: 'f',
      saturationShift: 'f',
      luminosityShift: 'f'
    });
  }

  return program;
}

function hslShiftJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    hueShift: parameters.hueShift,
    hueAttenuation: parameters.hueAttenuation,
    saturationShift: parameters.saturationShift,
    luminosityShift: parameters.luminosityShift
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = hslShiftJob;
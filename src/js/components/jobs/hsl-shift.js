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

      vec3 _rgb2hsl (vec3 col) {
        float minc = min( col.r, min(col.g, col.b) );
        float maxc = max( col.r, max(col.g, col.b) );
        vec3 mask = step(col.grr,col.rgb) * step(col.bbg,col.rgb);
        vec3 h = mask * (vec3(0.0,2.0,4.0) + (col.gbr-col.brg)/(maxc-minc + eps)) / 6.0;
        return vec3( fract( 1.0 + h.x + h.y + h.z ),              // H
                     (maxc-minc)/(1.0-abs(minc+maxc-1.0) + eps),  // S
                     (minc+maxc)*0.5 );                           // L
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
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

      vec3 _rgb2hsl (vec3 col) {
        float minc = min( col.r, min(col.g, col.b) );
        float maxc = max( col.r, max(col.g, col.b) );
        vec3  mask = step(col.grr,col.rgb) * step(col.bbg,col.rgb);
        vec3 h = mask * (vec3(0.0,2.0,4.0) + (col.gbr-col.brg)/(maxc-minc + eps)) / 6.0;
        return vec3( fract( 1.0 + h.x + h.y + h.z ),              // H
                     (maxc-minc)/(1.0-abs(minc+maxc-1.0) + eps),  // S
                     (minc+maxc)*0.5 );                           // L
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
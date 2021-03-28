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

      const int TYPE_NORMAL = 0;
      const int TYPE_DISSOLVE = 1;

      const int TYPE_LIGHTENONLY = 2;
      const int TYPE_SCREEN = 3;
      const int TYPE_DODGE = 4;
      const int TYPE_ADDITION = 5;

      const int TYPE_DARKENONLY = 6;
      const int TYPE_MULTIPLY = 7;
      const int TYPE_BURN = 8;

      const int TYPE_OVERLAY = 9;
      const int TYPE_SOFTLIGHT = 10;
      const int TYPE_HARDLIGHT = 11;

      const int TYPE_DIFFERENCE = 12;
      const int TYPE_EXCLUSION = 13;
      const int TYPE_NEGATION = 14;
      const int TYPE_SUBTRACT = 15;
      const int TYPE_GRAINEXTRACT = 16;
      const int TYPE_GRAINMERGE = 17;
      const int TYPE_DIVIDE = 18;

      const int TYPE_HUE = 19;
      const int TYPE_SATURATION = 20;
      const int TYPE_COLOR = 21;
      const int TYPE_VALUE = 22;

      const int TYPE_TEST = 99;
      const int TYPE_TEST2 = 98;

      const int TYPE_INCRUST = 23;
      const int TYPE_INCRUSTVALUE = 24;
      const int TYPE_TRANSITIONEDMULTIPLY = 25;
      const int TYPE_WEIGHTEDLIGHTENONLY = 26;
      const int TYPE_WEIGHTEDDARKENONLY = 27;
      const int TYPE_WEIGHTEDMULTIPLY = 28;
      const int TYPE_WEIGHTEDDIVIDE = 29;

      uniform int type;
      uniform float opacity;

      uniform sampler2D background;
      uniform bool backgroundSet;
      uniform vec2 backgroundSize;

      uniform sampler2D foreground;
      uniform bool foregroundSet;
      uniform vec2 foregroundSize;

      uniform sampler2D mask;
      uniform bool maskSet;
      uniform vec2 maskSize;

      float rand(vec2 co, float seed) {
        return fract(sin(seed + dot(co.xy + seed ,vec2(12.9898,78.233))) * 43758.5453);
      }

      const float eps = 0.0000001;

      vec3 _slerp(vec3 start, vec3 end, float percent)
      {
         // Dot product - the cosine of the angle between 2 vectors.
         float dot = dot(start, end);
         // Clamp it to be in the range of Acos()
         // This may be unnecessary, but floating point
         // precision can be a fickle mistress.
         dot = clamp(dot, -1.0, 1.0);
         // Acos(dot) returns the angle between start and end,
         // And multiplying that by percent returns the angle between
         // start and the final result.
         float theta = acos(dot)*percent;
         vec3 RelativeVec = normalize(end - start*dot); // Orthonormal basis
         // The final result.
         return ((start*cos(theta)) + (RelativeVec*sin(theta)));
      }

      vec3 _hsv2rgb( in vec3 c )
      {
        vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return c.z * mix( vec3(1.0), rgb, c.y);
      }

      vec3 _rgb2hsv( in vec3 c)
      {
        vec4 k = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
        vec4 p = mix(vec4(c.zy, k.wz), vec4(c.yz, k.xy), (c.z<c.y) ? 1.0 : 0.0);
        vec4 q = mix(vec4(p.xyw, c.x), vec4(c.x, p.yzx), (p.x<c.x) ? 1.0 : 0.0);
        float d = q.x - min(q.w, q.y);
        return vec3(abs(q.z + (q.w - q.y) / (6.0*d+eps)), d / (q.x+eps), q.x);
      }

      vec4 process (in vec2 uv) {
        vec3 foregroundRgb = foregroundSet == true ? texture(foreground, uv).rgb : vec3(0.);
        vec3 backgroundRgb = backgroundSet == true ? texture(background, uv).rgb : vec3(0.);
        vec3 maskRgb = maskSet == true ? texture(mask, uv).rgb : vec3(1.);

        vec3 backgroundHsv = vec3(0.);
        vec3 foregroundHsv = vec3(0.);
        float ratio = 0.;
        vec3 color = vec3(0.);
        float iseed = seed / 103.;

        float iopacity = opacity * (maskRgb.r + maskRgb.g + maskRgb.b) / 3.;

        switch(type) {
          case TYPE_DISSOLVE:
            color = mix(backgroundRgb, foregroundRgb, 0.0025 + rand(uv, iseed) * 0.995 < iopacity ? 1. : 0.);
            break;
          case TYPE_MULTIPLY:
            color = mix(backgroundRgb, backgroundRgb * foregroundRgb, iopacity);
            break;
          case TYPE_DIVIDE:
            color = mix(backgroundRgb, clamp((256. * backgroundRgb) / (foregroundRgb * 255. + 1.), 0., 1.), iopacity);
            break;
          case TYPE_SCREEN:
            color = mix(backgroundRgb, 1. - (1. - backgroundRgb) * (1. - foregroundRgb), iopacity);
            break;
          case TYPE_OVERLAY:
            color = mix(backgroundRgb, backgroundRgb * (backgroundRgb + 2. * foregroundRgb * (1. - backgroundRgb)), iopacity);
            break;
          case TYPE_DODGE:
            color = mix(backgroundRgb, 256. * 255. * backgroundRgb / (255. - foregroundRgb * 255. + 1.) / 255., iopacity);
            break;
          case TYPE_BURN:
            color = mix(backgroundRgb, (255. - (256. * (255. - backgroundRgb * 255.)) / (foregroundRgb * 255. + 1.)) / 255., iopacity);
            break;
          case TYPE_HARDLIGHT:
            color = mix(backgroundRgb, mix(
              (255. -  ((255. - 2. * (foregroundRgb * 255. - 128.)) * (255. - backgroundRgb * 255.)) / 256.) / 255.,
              2. * foregroundRgb * backgroundRgb * 255. / 256.,
              vec3(
                foregroundRgb.r > 128. / 255. ? 0. : 1.,
                foregroundRgb.g > 128. / 255. ? 0. : 1.,
                foregroundRgb.b > 128. / 255. ? 0. : 1.
              )
            ), iopacity);
            break;
          case TYPE_SOFTLIGHT:
            color = 1. - (1. - backgroundRgb) * (1. - foregroundRgb);
            color = mix(backgroundRgb, ((1. - backgroundRgb) * foregroundRgb + color) * backgroundRgb, iopacity);
            break;
          case TYPE_GRAINEXTRACT:
            color = mix(backgroundRgb, clamp(backgroundRgb - foregroundRgb  + 128. / 255., 0., 1.), iopacity);
            break;
          case TYPE_GRAINMERGE:
            color = mix(backgroundRgb, clamp(backgroundRgb + foregroundRgb  - 128. / 255., 0., 1.), iopacity);
            break;
          case TYPE_DIFFERENCE:
            color = mix(backgroundRgb, abs(backgroundRgb - foregroundRgb), iopacity);
            break;
          case TYPE_NEGATION:
            color = mix(backgroundRgb, 1. - abs(1. - backgroundRgb - foregroundRgb), iopacity);
            break;
          case TYPE_EXCLUSION:
            color = mix(backgroundRgb, backgroundRgb + foregroundRgb - backgroundRgb * foregroundRgb * 2., iopacity);
            break;
          case TYPE_ADDITION:
            color = mix(backgroundRgb, min(backgroundRgb + foregroundRgb, 1.), iopacity);
            break;
          case TYPE_SUBTRACT:
            color = mix(backgroundRgb, max(backgroundRgb - foregroundRgb, 0.), iopacity);
            break;
          case TYPE_DARKENONLY:
            color = mix(backgroundRgb, min(backgroundRgb, foregroundRgb), iopacity);
            break;
          case TYPE_LIGHTENONLY:
            color = mix(backgroundRgb, max(backgroundRgb, foregroundRgb), iopacity);
            break;
          case TYPE_HUE:
            color = mix(backgroundRgb, _hsv2rgb(vec3(_rgb2hsv(foregroundRgb).r, _rgb2hsv(backgroundRgb).gb)), iopacity);
            break;
          case TYPE_COLOR:
            color = mix(backgroundRgb, _hsv2rgb(vec3(_rgb2hsv(foregroundRgb).rg, _rgb2hsv(backgroundRgb).b)), iopacity);
            break;
          case TYPE_SATURATION:
            vec3 backgroundHsv = _rgb2hsv(backgroundRgb);
            color = mix(backgroundRgb, _hsv2rgb(vec3(backgroundHsv.r, _rgb2hsv(foregroundRgb).g, backgroundHsv.b)), iopacity);
            break;
          case TYPE_VALUE:
            color = mix(backgroundRgb, _hsv2rgb(vec3(_rgb2hsv(backgroundRgb).rg, _rgb2hsv(foregroundRgb).b)), iopacity);
            break;

          case TYPE_INCRUST:
            ratio = sign(length(backgroundRgb) - length(foregroundRgb)) * pow(abs(length(backgroundRgb) - length(foregroundRgb)) / 1.732050808 / 2., 0.5) + 0.5;
            color = mix(backgroundRgb, mix(backgroundRgb, foregroundRgb, smoothstep(0., 1., ratio)), iopacity);
            break;

          case TYPE_INCRUSTVALUE:
            foregroundHsv = _rgb2hsv(foregroundRgb);
            backgroundHsv = _rgb2hsv(backgroundRgb);
            ratio = sign(backgroundHsv.b - foregroundHsv.b) * pow(abs(backgroundHsv.b - foregroundHsv.b) / 2., 0.5) + 0.5;
            color = mix(
              backgroundRgb,
              _hsv2rgb(vec3(
                foregroundHsv.rg, mix(
                  backgroundHsv.b, foregroundHsv.b, smoothstep(0., 1., ratio)
                )
              )),
              iopacity
            );
            break;

          case TYPE_TRANSITIONEDMULTIPLY:
            color = mix(backgroundRgb, mix(clamp((backgroundRgb * foregroundRgb + foregroundRgb * 0.25) / 1.25, 0., 1.), foregroundRgb, min(1., iopacity * 2. - 1.)),min(1., iopacity * 2.));
            break;

          case TYPE_WEIGHTEDDARKENONLY:
            color = mix(backgroundRgb, foregroundRgb, pow(iopacity, log(0.25 + iopacity * 0.75) / log(iopacity * 0.125 + 0.875 * length(foregroundRgb) / 1.732050808)));
            break;

          case TYPE_WEIGHTEDLIGHTENONLY:
            color = mix(backgroundRgb, foregroundRgb, pow(iopacity, log(0.25 + iopacity * 0.75) / log(iopacity * 0.125 + 0.875 * (1. - length(foregroundRgb) / 1.732050808))));
            break;

          case TYPE_WEIGHTEDMULTIPLY:
            color = mix(backgroundRgb, backgroundRgb * mix(vec3(mix(1., pow(length(foregroundRgb) / 1.732050808, 2.0), iopacity)), foregroundRgb, iopacity), iopacity);
            break;

          case TYPE_WEIGHTEDDIVIDE:
            color = mix(backgroundRgb, clamp(backgroundRgb / mix(vec3(mix(1., pow(length(foregroundRgb) / 1.732050808, 0.5), iopacity)), foregroundRgb, iopacity), 0., 1.), iopacity);
            break;

          /*
          case TYPE_TEST:
            vec3 nBack = normalize(backgroundRgb.rgb);
            float qBack = clamp((backgroundRgb.r + backgroundRgb.g + backgroundRgb.b - 0.05) / 1.5, 0., 1.);
            float vBack = length(backgroundRgb.rgb) / length(nBack);
            vec3 nFore = normalize(foregroundRgb.rgb);
            float vFore = length(foregroundRgb.rgb) / length(nFore);
            float qFore = clamp((foregroundRgb.r + foregroundRgb.g + foregroundRgb.b - 0.05) / 1.5, 0., 1.);
            float iopacity = iopacity + (1. - iopacity) * mix(0., vFore - vBack, 1. - abs(iopacity * 2. - 1.));

            color = _slerp(nBack, nFore, iopacity) * mix(vBack, vFore, iopacity);

            color = mix(mix(backgroundRgb, foregroundRgb, iopacity), color, pow(mix(qBack, qFore, iopacity), 2.));
            break;

          case TYPE_TEST2:
            vec3 mcolor = mix(backgroundRgb, vec3(1.), iopacity) * mix(vec3(1.), foregroundRgb, iopacity);

            color = normalize(mcolor) * mix(length(backgroundRgb), length(foregroundRgb), iopacity);

            //color = mix(mix(backgroundRgb, foregroung, iopacity), )

            break;
          */


          case TYPE_NORMAL:
          default:
            color = mix(backgroundRgb, foregroundRgb, iopacity);
            break;
        }


        return vec4(clamp(color, 0., 1.), 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      foreground: 't',
      background: 't',
      mask: 't',
      type: 'i',
      opacity: 'f',
      seed: 'f'
    });
  }

  return program;
}

function blendJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    foreground: inputs.foreground,
    background: inputs.background,
    mask: inputs.mask,
    type: parameters.type,
    opacity: parameters.opacity,
    seed: parameters.seed
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = blendJob;
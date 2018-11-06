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

      const int FILL_COLOR_WHITE = 0;
      const int FILL_COLOR_RANDOM_GRAYS = 1;
      const int FILL_COLOR_RANDOM_COLORS = 2;

      const int FILL_MODE_DISTANCE_BORDER = 0;
      const int FILL_MODE_DISTANCE_POINT = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int scale;
      uniform float jitter;
      uniform bool useInterstice;
      uniform float intersticeWidth;
      uniform float edgeSmoothness;
      uniform int fillMode;
      uniform int fillColor;
      uniform float fillModeStrength;

      float hash1 (vec2 n, float seed) {
        return fract(sin(dot(n + seed / 120.795,vec2(127.1 + seed/33., 311.7 +seed/35.)))*(43758.5453 + seed*101.3579));
      }

      vec2 hash2 (vec2 p, float seed) {
        p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
        return fract(sin(p + seed)*(43758.5453 + seed));
      }

      vec3 hash3 (vec2 p, float seed) {
        vec3 p3 = vec3( dot(p + seed / 120.795,vec2(197.5,213.7)), dot(p + seed / 128.795,vec2(127.1,311.7)), dot(p + seed / 143.795,vec2(269.5,183.3)) );
        return fract(sin(p3 + seed)*(43758.5453 + seed));
      }

      float processStep (in vec2 uv, out float md, out float md2, out vec3 color) {
        float iscale = float(scale);
        float iseed = seed / 103.;
        vec2 n = floor(uv * iscale);
        vec2 f = fract(uv * iscale);

        //----------------------------------
        // first pass: regular voronoi
        //----------------------------------
        vec2 mg = vec2(0.);
        vec2 mr = vec2(0.);
        vec3 mc = vec3(0.);

        md = 8.0;
        for( float j=-1.; j<=1.; j++ )
        for( float i=-1.; i<=1.; i++ )
        {
          vec2 g = vec2(i,j);
          vec2 o = mix(vec2(0.5, 0.5), hash2( mod(n + g, iscale) , iseed), jitter);
          vec2 r = g + o - f;
          float d = dot(r, r);

          if (d<md) {
            md = d;
            mr = r;
            mg = g;
            mc = hash3(mod(n + g, iscale) , iseed);
          }
        }

        //----------------------------------
        // second pass: distance to borders
        //----------------------------------
        md2 = 999.;
        for( float j=-2.; j<=2.; j++ )
        for( float i=-2.; i<=2.; i++ )
        {
          vec2 g = mg + vec2(i,j);
          vec2 o = mix(vec2(0.5, 0.5), hash2( mod(n + g, iscale), iseed ), jitter);
          vec2 r = g + o - f;

          if( dot(mr-r,mr-r)>0.00001 ) {
            float d = dot( 0.5*(mr+r), normalize(r-mr) );
            md2 = min(d, md2);
          }
        }

        color = mc;

        return md2;
    }

      vec4 process (in vec2 uv) {
        vec3 fill;
        float md2;
        float md;

        processStep(uv, md, md2, fill);

        if (fillColor == FILL_COLOR_RANDOM_COLORS) {
          fill = fill;
        } else if (fillColor == FILL_COLOR_RANDOM_GRAYS) {
          fill = fill.ggg;
        } else {
          fill = vec3(1.);
        }

        if (fillMode == FILL_MODE_DISTANCE_BORDER) {
          if (useInterstice == true) {
            fill *= mix(1., clamp((md2 * 1.4 - intersticeWidth * 0.7) / (1. - intersticeWidth * 0.7), 0., 1.), fillModeStrength);
          } else {
            fill *= mix(1., clamp(md2 * 1.4, 0., 1.), fillModeStrength);
          }
        } else if (fillMode == FILL_MODE_DISTANCE_POINT) {
          if (useInterstice == true) {
            fill *= mix(1., clamp((1. - pow(md, 0.75) - intersticeWidth * 0.5) / (1. - intersticeWidth * 0.5), 0., 1.), fillModeStrength);
          } else {
            fill *= mix(1., 1. - pow(md, 0.75), fillModeStrength);
          }
        }

        if (useInterstice == true) {
          fill = fill*vec3(mix(0., 1., smoothstep(intersticeWidth * 0.5 - 0.05 * edgeSmoothness,intersticeWidth * 0.5 + 0.05 * edgeSmoothness,md2)));
        }

        return vec4(fill, 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      scale: 'i',
      jitter: 'f',
      useInterstice: 'b',
      intersticeWidth: 'f',
      edgeSmoothness: 'f',
      fillMode: 'i',
      fillColor: 'i',
      fillModeStrength: 'f'
    });
  }

  return program;
}

function cellularNoiseJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    scale: parameters.scale,
    jitter: parameters.jitter,
    useInterstice: parameters.useInterstice,
    intersticeWidth: parameters.intersticeWidth,
    edgeSmoothness: parameters.edgeSmoothness,
    fillMode: parameters.fillMode,
    fillColor: parameters.fillColor,
    fillModeStrength: parameters.fillModeStrength,
    seed: parameters.seed
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = cellularNoiseJob;
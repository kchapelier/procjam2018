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

      uniform int scale;
      uniform float smoothness;
      uniform float jitter;

      vec3 hash3(in vec2 p, float seed)
      {
          vec3 q = vec3(
            dot(p + seed / 12000.795, vec2(127.1, 311.7)),
            dot(p + seed / 12800.795, vec2(269.5, 183.3)),
            dot(p + seed / 14300.795, vec2(419.2, 371.9))
          );

          return fract(sin(q + seed / 2777.) * (43758.5453 + seed / 999.));
      }

      float iqnoise(in vec2 uv)
      {
        float iscale = float(scale * 2);
        uv*= iscale;
        vec2 p = floor(uv);
        vec2 f = fract(uv);

        float k = 0.95 + 35.05 * pow(1.0 - smoothness, 6.0);

        float va = 0.0;
        float wt = 0.0;
        for(float j = -2.; j <= 2.; j++) {
          for(float i = -2.; i <= 2.; i++) {
            vec2 g = vec2(i, j);
            vec3 o = hash3(mod(p + g, iscale), seed) * vec3(jitter, jitter, 1.0);
            vec2 r = g - f + o.xy;
            float d = dot(r, r);
            float ww = pow(1.0 - smoothstep(0., 1.414,sqrt(d)), k);
            va += o.z*ww;
            wt += ww;
          }
        }

        return va/wt;
      }

      vec4 process (in vec2 uv) {
        return vec4(vec3(iqnoise(uv)), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      scale: 'i',
      smoothness: 'f',
      jitter: 'f',
      seed: 'f'
    });
  }

  return program;
}

function voronoiseJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    scale: parameters.scale,
    smoothness: parameters.smoothness,
    jitter: parameters.jitter,
    seed: parameters.seed
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = voronoiseJob;
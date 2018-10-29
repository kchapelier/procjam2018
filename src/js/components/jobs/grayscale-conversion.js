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

      const int TYPE_DESATURATION = 0;
      const int TYPE_LUMA = 1;
      const int TYPE_AVERAGE = 2;
      const int TYPE_MAX = 3;
      const int TYPE_MIN = 4;
      const int TYPE_WEIGHTED = 5;

      uniform vec2 resolution;
      uniform float seed;

      uniform int type;
      uniform vec3 weights;
      uniform bool normalizeWeights;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;


      vec3 _rgb2hsv (const in vec3 c){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 _hsv2rgb (const in vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      float _luma (const in vec4 c) {
        return dot(c.rgb, vec3(0.299, 0.587, 0.114));
      }

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv);

        float gray = 0.;

        if (type == TYPE_DESATURATION) {
          vec3 baseHsv = _rgb2hsv(base.rgb);
          baseHsv.g = 0.;
          base.rgb = _hsv2rgb(baseHsv);
          gray = (base.r + base.g + base.b) / 3.;
        } else if (type == TYPE_LUMA) {
          gray = _luma(base);
        } else if (type == TYPE_AVERAGE) {
          gray = (base.r + base.g + base.b) / 3.;
        } else if (type == TYPE_MAX) {
          gray = max(base.r, max(base.g, base.b));
        } else if (type == TYPE_MIN) {
          gray = min(base.r, min(base.g, base.b));
        } else if (type == TYPE_WEIGHTED) {
          float maxGray = max(0.0001, max(0., weights.r) + max(0., weights.g) + max(0., weights.b));
          gray = clamp(
            base.r * weights.r +
            base.g * weights.g +
            base.b * weights.b,
            0., maxGray
          );

          if (normalizeWeights) {
            gray /= maxGray;
          }
        }

        gray = clamp(gray, 0., 1.);

        return vec4(vec3(gray), 1.);
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
      weights: '3f',
      normalizeWeights: 'b'
    });
  }

  return program;
}

function grayscaleConversionJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    type: parameters.type,
    weights: parameters.weights,
    normalizeWeights: parameters.normalizeWeights
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = grayscaleConversionJob;
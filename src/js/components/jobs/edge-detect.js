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

      const int FILTERTYPE_SOBEL = 0;
      const int FILTERTYPE_PREWITT = 1;
      const int FILTERTYPE_FREI_CHEN = 2;

      const int OUTPUT_MASK = 0;
      const int OUTPUT_GRAYS = 1;
      const int OUTPUT_COLORS = 2;

      uniform vec2 resolution;
      uniform float seed;

      uniform int filterType;
      uniform int outputType;
      uniform float maskThreshold;
      uniform float threshold;
      uniform float dist;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec3 processFreiChen (in vec2 uv, in vec2 p, in float threshold, in float dist) {
        p = p * dist;

        vec4 ccc = texture(source, uv);
        vec4 clu = texture(source, uv + p * vec2(-1., -1.));
        vec4 clc = texture(source, uv + p * vec2(-1., 0.));
        vec4 cld = texture(source, uv + p * vec2(-1., 1.));
        vec4 cru = texture(source, uv + p * vec2(1., -1.));
        vec4 crc = texture(source, uv + p * vec2(1., 0.));
        vec4 crd = texture(source, uv + p * vec2(1., 1.));
        vec4 ccu = texture(source, uv + p * vec2(0., -1.));
        vec4 ccd = texture(source, uv + p * vec2(0., 1.));

        float sqrt2 = sqrt(2.);

        vec4 g1 = (clu + cru + (ccu - ccd) * sqrt2 - cld - crd) / 2. / sqrt2;
        vec4 g2 = (clu + cld + (clc - crc) * sqrt2 - cru - crd) / 2. / sqrt2;
        vec4 g3 = (clc + ccd + (cru - cld) * sqrt2 - ccu - crc) / 2. / sqrt2;
        vec4 g4 = (crc + ccd + (clu - crd) * sqrt2 - clc - ccu) / 2. / sqrt2;

        vec4 g5 = (ccu + ccd - clc - crc) / 2.;
        vec4 g6 = (cld + cru - crd - clu) / 2.;
        vec4 g7 = (ccc * 4. - (ccu + ccd + clc + crc) * 2. + cru + clu + cld + crd) / 6.;
        vec4 g8 = (ccc * 4. - (cru + clu + cld + crd) * 2. + ccu + ccd + clc + crc) / 6.;
        vec4 g9 = (ccc + ccu + ccd + clc + crd + clu + cld + crd + cru) / 3.;

        vec4 m = (g1 * g1) + (g2 * g2) + (g3 * g3) + (g4 * g4);
        vec4 s = m + (g5 * g5) + (g6 * g6) + (g7 * g7) + (g8 * g8) + (g9 * g9);

        vec4 edge = (clamp(sqrt(m/s) * 1.3, 0., 1.) - threshold) / (1. - threshold);
        edge = edge / (0.1 + 0.9 * dist);
        edge = clamp(edge, 0., 1.);

        return edge.rgb;
      }

      vec3 processPrewitt (in vec2 uv, in vec2 p, in float threshold, in float dist) {
        p = p * dist;

        vec4 cpp = texture(source, uv + p * vec2(-1., -1.));
        vec4 cpc = texture(source, uv + p * vec2(-1., 0.));
        vec4 cpn = texture(source, uv + p * vec2(-1., 1.));
        vec4 cnp = texture(source, uv + p * vec2(1., -1.));
        vec4 cnc = texture(source, uv + p * vec2(1., 0.));
        vec4 cnn = texture(source, uv + p * vec2(1., 1.));
        vec4 ccp = texture(source, uv + p * vec2(0., -1.));
        vec4 ccn = texture(source, uv + p * vec2(0., 1.));

        vec4 gx = cnp + cnn + cnc - cpc - cpp - cpn;
        vec4 gy = cpn + cnn + ccn - ccp - cpp - cnp;

        vec4 edge = (clamp(sqrt(gx * gx + gy * gy), 0., 1.) - threshold) / (1. - threshold);
        edge = edge / (0.1 + 0.9 * dist);
        edge = clamp(edge, 0., 1.);

        return edge.rgb;
      }

      vec3 processSobel (in vec2 uv, in vec2 p, in float threshold, in float dist) {
        p = p * dist;

        vec4 cpp = texture(source, uv + p * vec2(-1., -1.));
        vec4 cpc = texture(source, uv + p * vec2(-1., 0.));
        vec4 cpn = texture(source, uv + p * vec2(-1., 1.));
        vec4 cnp = texture(source, uv + p * vec2(1., -1.));
        vec4 cnc = texture(source, uv + p * vec2(1., 0.));
        vec4 cnn = texture(source, uv + p * vec2(1., 1.));
        vec4 ccp = texture(source, uv + p * vec2(0., -1.));
        vec4 ccn = texture(source, uv + p * vec2(0., 1.));

        vec4 gx = cnp + cnn + (cnc - cpc) * 2. - cpp - cpn;
        vec4 gy = cpn + cnn + (ccn - ccp) * 2. - cpp - cnp;

        vec4 edge = (clamp(sqrt(gx * gx + gy * gy), 0., 1.) - threshold) / (1. - threshold);
        edge = edge / (0.1 + 0.9 * dist);
        edge = clamp(edge, 0., 1.);

        return edge.rgb;
      }

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution;

        vec3 edge = vec3(0.);

        if (filterType == FILTERTYPE_PREWITT) {
          edge = processPrewitt(uv, p, threshold, dist);
        } else if (filterType == FILTERTYPE_FREI_CHEN) {
          edge = processFreiChen(uv, p, threshold, dist);
        } else {
          edge = processSobel(uv, p, threshold, dist);
        }

        if (outputType == OUTPUT_MASK) {
          float factor = clamp(max(max(edge.r, edge.b), edge.g), 0., 1.);
          edge = vec3(mix(0., 1., smoothstep(max(0., maskThreshold - 0.05), min(1., maskThreshold + 0.05), factor)));
        } else if (outputType == OUTPUT_GRAYS) {
          float factor = clamp(max(max(edge.r, edge.b), edge.g), 0., 1.);
          edge = vec3(factor);
        }

        return vec4(edge, 1.);
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
      filterType: 'i',
      outputType: 'i',
      maskThreshold: 'f',
      threshold: 'f',
      dist: 'f'
    });
  }

  return program;
}

function edgeDetectJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    filterType: parameters.filterType,
    outputType: parameters.outputType,
    maskThreshold: parameters.maskThreshold,
    threshold: parameters.threshold,
    dist: 1
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = edgeDetectJob;
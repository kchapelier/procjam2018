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

      const int TYPE_SIMILAR = 0;
      const int TYPE_ALTERNATE = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int type;
      uniform int scale;
      uniform float intersticeWidth;
      uniform float edgeSmoothness;
      uniform float edgeRoundness;
      uniform float offsetOddRows;
      uniform float offsetEvenRows;
      uniform float offsetRandomization;

      float rand(float n, float seed){
        return fract(sin(n + seed / 1000.) * (43758.5453123 + seed / 100.));
      }

      float type1process (in vec2 uv) {
        float iscale = float(scale) * 2.;
        float l = mod(floor(uv.y * 2. * iscale + 1.), 2.);
        float row = floor(uv.y * 2. * iscale + 1.);

        vec2 nuv = fract((uv * vec2(1., 2.) * iscale) + vec2(mix(offsetEvenRows, offsetOddRows + 0.5, l) + offsetRandomization * (rand(row, seed) - 0.5) * 2., 0.));

        return mix(
          //chebishev distance from the center
          max(abs(nuv.x - 0.5) / (1. + intersticeWidth / 2.), abs(nuv.y - 0.5)) * 2.,
          // euclidean distance from center
          pow(pow(nuv.x - 0.5, 2.) / (1. + intersticeWidth / 2.) + pow(nuv.y - 0.5, 2.), 0.5) * 2.,
          edgeRoundness * 0.05
        );
      }

      float type2process (in vec2 uv) {
        float iscale = float(scale);
        float l = mod(floor(uv.y * 4. * iscale + 1.), 2.);
        float row = floor(uv.y * 4. * iscale + 1.);

        vec2 nuv = fract((uv * vec2(1. + l, 4.) * iscale) + vec2(mix(offsetEvenRows, offsetOddRows + 0.5, l) + offsetRandomization * (rand(row, seed) - 0.5) * 2., 0.));

        return mix(
          //chebishev distance from the center
          max(abs(nuv.x - 0.5) / (1. + intersticeWidth / (1. + l)), abs(nuv.y - 0.5)) * 2.,
          // euclidean distance from center
          pow(pow(nuv.x - 0.5, 2.) / (1. + intersticeWidth / (1. + l)) + pow(nuv.y - 0.5, 2.), 0.5) * 2.,
          edgeRoundness * 0.05
        );
      }

      vec4 process (in vec2 uv) {
        float n = 0.;

        if (type == TYPE_SIMILAR) {
          n = type1process(uv);
        } else {
          n = type2process(uv);
        }

        n = 1. - (n + intersticeWidth);

        n = clamp(n * mix(200., 8., pow(edgeSmoothness, 0.125)), 0., 1.);

        return vec4(vec3(n), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      type: 'i',
      scale: 'i',
      intersticeWidth: 'f',
      edgeSmoothness: 'f',
      edgeRoundness: 'f',
      seed: 'f',
      offsetOddRows: 'f',
      offsetEvenRows: 'f',
      offsetRandomization: 'f'
    });
  }

  return program;
}

function bricksJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    type: parameters.type,
    scale: parameters.scale,
    intersticeWidth: parameters.intersticeWidth,
    edgeSmoothness: parameters.edgeSmoothness,
    edgeRoundness: parameters.edgeRoundness,
    seed: parameters.seed,
    offsetOddRows: parameters.offsetOddRows,
    offsetEvenRows: parameters.offsetEvenRows,
    offsetRandomization: parameters.offsetRandomization
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = bricksJob;
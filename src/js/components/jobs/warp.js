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

      uniform float intensity;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D intensityMap;
      uniform bool intensityMapSet;
      uniform vec2 intensityMapSize;

      vec2 getDir (in vec2 uv, in vec2 p) {
        vec3 ccc = texture(intensityMap, uv).rgb;
        float fcc = (ccc.r + ccc.g + ccc.b) / 3.;

        vec2 dir = vec2(0.);

        for (float i = 0.; i < 20.; i++) {
          float cangle = i / 20. * 6.283185307179586;
          vec2 cdir = vec2(cos(cangle), sin(cangle));
          vec3 crgb = texture(intensityMap, uv + p * cdir * 0.5).rgb;
          float cweight = fcc - (crgb.r + crgb.g + crgb.b) / 3.;
          dir -= cdir * cweight * 1.5;
        }

        return dir;
      }

      vec4 process (in vec2 uv) {
        vec2 p = 1. / resolution.xy;

        vec2 dir = intensityMapSet == true ? getDir(uv, p) : vec2(0., 0.);

        return vec4(texture(source, uv + dir * intensity * 0.2).rgb, 1.);
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
      intensityMap: 't',
      source: 't',
      intensity: 'f'
    });
  }

  return program;
}

function warpJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var uniforms = {
    source: inputs.input,
    intensityMap: inputs.intensity,
    intensity: parameters.intensity
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = warpJob;
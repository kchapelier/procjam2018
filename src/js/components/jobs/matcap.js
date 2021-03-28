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

      const float _PI = 3.141592653589793;

      uniform vec2 resolution;
      uniform float seed;

      uniform sampler2D normalMap;
      uniform bool normalMapSet;
      uniform vec2 normalMapSize;

      uniform sampler2D matcapMap;
      uniform bool matcapMapSet;
      uniform vec2 matcapMapSize;

      uniform float rotation;
      uniform float zoom;
      uniform float curveMultiplier;
      uniform float curveIncrease;

      vec2 rotate(in vec2 v, in float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec4 process (in vec2 uv) {
        vec3 packedNormal = texture(normalMap, uv).rgb;

        vec3 cuv3 = (packedNormal.rgb - 0.5) * 2.0;
        cuv3.z = cuv3.z * curveMultiplier + curveIncrease;
        cuv3 = normalize(cuv3);
        cuv3.rg = rotate(cuv3.rg, rotation) / zoom;

        return texture(matcapMap, (cuv3.rg + 1.0) / 2.0);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;

        if (normalMapSet == true && matcapMapSet == true) {
          fragColor = process(uv);
        } else {
          fragColor = vec4(0., 0., 0., 1.);
        }
      }

    `, {
      normalMap: 't',
      matcapMap: 't',
      rotation: 'f',
      zoom: 'f',
      curveMultiplier: 'f',
      curveIncrease: 'f'
    });
  }

  return program;
}

function matcapJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var uniforms = {
    normalMap: inputs.normal,
    matcapMap: inputs.matcap,
    rotation: parameters.rotation,
    zoom: parameters.zoom,
    curveMultiplier: parameters.curveMultiplier,
    curveIncrease: parameters.curveIncrease,
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = matcapJob;
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

      const int FORMAT_OPENGL = 0;
      const int FORMAT_DIRECTX = 1;

      uniform vec2 resolution;
      uniform float seed;

      uniform int format;
      uniform float intensity;
      uniform float fineDetails;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float sampleHeight (vec2 uv) {
        vec4 base = sourceSet == true ? texture(source, uv) : vec4(0.5, 0.5, 0.5, 1.);
        return (base.r + base.g + base.b) / 3.;
      }

      vec3 packNormalToRGB(const in vec3 normal) {
        return normalize(normal) * 0.5 + 0.5;
      }

      vec3 sampleNormal (vec2 uv, float heightScale, float fineDetails) {
        float ccc = sampleHeight(uv);
        vec2 step = 1. / resolution;

        vec3 vs[8];

        vec2 formatModifier = format == FORMAT_OPENGL ? vec2(-1., 1.) : vec2(1., 1.);

        for (int i = 0; i < 8; i++) {
          float angle = float(i) / 8. * 2. * 3.1418;
          vec2 dir = vec2(cos(angle), sin(angle));
          float ccn = (sampleHeight(uv + 0.66 * step * dir) + sampleHeight(uv + 0.33 * step * dir)) / 2.;
          float diff = (ccn - ccc);

          diff = mix(diff, sign(diff) * max(abs(diff) - 0.0025, 0.), 3. - 6. * fineDetails);

          vs[i] = vec3(dir * formatModifier, diff * heightScale);
        }

        vec3 sum = vec3(0.);

        for (int i = 0; i < 8; i++) {
          sum += cross(vs[i], vs[(i+1) % 8]);
        }

        vec3 normals = normalize(sum * -1.);

        return packNormalToRGB(vec3(normals.r, normals.g, 0.5));
      }


      vec4 process (in vec2 uv) {
        return vec4(sampleNormal(uv, intensity * 3.3, fineDetails), 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      source: 't',
      format: 'i',
      intensity: 'f',
      fineDetails: 'f'
    });
  }

  return program;
}

function heightToNormalJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    format: parameters.format,
    intensity: parameters.intensity,
    fineDetails: parameters.fineDetails
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = heightToNormalJob;
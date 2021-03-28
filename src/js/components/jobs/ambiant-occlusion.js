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

      #define PIm2 6.2831853071796

      uniform vec2 resolution;
      uniform float seed;

      uniform float amount;
      uniform float size;
      uniform float threshold;
      uniform float power;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      const float iterationsA = 12.0;
      const float iterationsR = 6.0;

      float getDepth (in vec2 uv) {
        return texture(source, uv).r;
      }

      vec4 process (in vec2 uv) {
        float depthRef = getDepth(uv);
        float occlusion = 0.;
        float p = size / 1024. * 5.;

        for (float k = 0.; k < iterationsR; k++) {
          float radius = (1. + k);
          float weight = 1. - pow((iterationsR - k) / iterationsR, 2.);
          for (float i = 0.; i < iterationsA; i++) {
            float angle = i / iterationsA * PIm2 + k;
            float otherDepth = getDepth(uv + p * radius * vec2(cos(angle), sin(angle)));
            float diff = (otherDepth - 0.001) - depthRef;

            if (diff > 0.) {
                occlusion += pow(diff, 0.5) * weight / iterationsA;
            }
          }
        }
        
        occlusion = clamp((occlusion - threshold) / (1. - threshold), 0., 1.);
        occlusion = pow(occlusion, power);
        
        return vec4(vec3(1. - occlusion * amount), 1.);
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
      amount: 'f',
      size: 'f',
      threshold: 'f',
      power: 'f',
      source: 't'
    });
  }

  return program;
}

function ambiantOcclusionJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.heightmap,
    amount: parameters.amount,
    size: parameters.size,
    threshold: parameters.threshold,
    power: parameters.power
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = ambiantOcclusionJob;
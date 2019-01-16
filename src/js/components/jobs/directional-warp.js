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

      uniform float angle;
      uniform bool intensityCenteredOnGray;
      uniform float intensity;
      uniform float angleIntensity;
      uniform bool angleCenteredOnGray;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D intensityMap;
      uniform bool intensityMapSet;
      uniform vec2 intensityMapSize;

      uniform sampler2D angleMap;
      uniform bool angleMapSet;
      uniform vec2 angleMapSize;

      vec4 process (in vec2 uv) {
        vec3 base = vec3(0.);
        float i = 0.;
        float a = 0.;

        if (intensityMapSet == true) {
          base = texture(intensityMap, uv).rgb;

          i = (base.r + base.g + base.b) / 3.;

          if (intensityCenteredOnGray == true) {
              i = i * 2. - 1.;
          }
        }

        i = i * intensity;

        if (angleMapSet == true) {
          base = texture(angleMap, uv).rgb;

          a = (base.r + base.g + base.b) / 3.;

          if (angleCenteredOnGray == true) {
              a = a * 2. - 1.;
          }
        }

        float iangle = angle + a * angleIntensity * 6.2831853071795;

        uv = uv - vec2(cos(iangle), sin(iangle)) * i;

        vec3 c = texture(source, uv).rgb;

        return vec4(c, 1.);
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
      intensityMap: 't',
      angleMap: 't',
      angle: 'f',
      intensityCenteredOnGray: 'b',
      intensity: 'f',
      angleIntensity: 'f',
      angleCenteredOnGray: 'b'
    });
  }

  return program;
}

function directionalWarpJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    intensityMap: inputs.intensity,
    angleMap: inputs.angle,

    angle: parameters.angle,
    intensityCenteredOnGray: parameters.intensityCenteredOnGray,
    intensity: parameters.intensity,
    angleIntensity: parameters.angleIntensity,
    angleCenteredOnGray: parameters.angleCenteredOnGray
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = directionalWarpJob;
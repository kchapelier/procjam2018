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

      #define PI   3.1415926535898
      #define PIm2 6.2831853071796
      #define PId2 1.5707963267949
      #define E    2.7182818284590

      const int SHAPE_CIRCLE = 0;
      const int SHAPE_POLYGON = 1;

      uniform int type;
      uniform int patternAmount;
      uniform int segments;
      uniform int rowNumber;

      uniform float width;
      uniform float radius;
      uniform float rotation;
      uniform float patternRotation;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 nuv = vec2(0.);

        if (type == SHAPE_CIRCLE) {
          uv = (uv - 0.5) / width;

          nuv.x = fract(0.5+atan(uv.y, uv.x) / PIm2 * float(patternAmount) - rotation / PIm2 * float(patternAmount));
          nuv.y = length(uv) * 2. - radius * 2.;
        } else {
          uv = (uv - 0.5) / width;

          float isegments = float(segments);
          float angle = mod(PIm2 + PId2 + atan(uv.y, uv.x) - rotation, PIm2);
          float pangle = floor((angle / PIm2) * isegments) / isegments * PIm2;
          float nangle = ceil((angle / PIm2) * isegments) / isegments * PIm2;

          uv *= 2. * length(mix(vec2(cos(pangle), sin(pangle)), vec2(cos(nangle), sin(nangle)), 0.5));

          float alpha = mod(angle - PId2 / isegments * (isegments - 2.), PIm2 / isegments);
          float delta = PId2 - PI / isegments;
          float gamma = PI - alpha - delta;

          float l = sin(alpha) / sin(gamma);
          float L = sin(PIm2 / isegments) / sin(delta);

          float nx = l / L;

          nuv.x = fract(angle/ PIm2 * float(patternAmount) - patternRotation / PIm2) ;
          nuv.y = length(uv) * 2. / length(mix(vec2(cos(pangle), sin(pangle)), vec2(cos(nangle), sin(nangle)), nx) * 2.) - radius / width;
        }

        return nuv.y >= 0. && nuv.y < float(rowNumber) ? texture(source, nuv) : vec4(0.,0.,0.,1.);
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
      segments: 'i',
      patternAmount: 'i',
      rowNumber: 'i',
      radius: 'f',
      width: 'f',
      rotation: 'f',
      patternRotation: 'f'
    });
  }

  return program;
}

function shapeMapperJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    type: parameters.type,
    patternAmount: parameters.patternAmount,
    rowNumber: parameters.rowNumber,
    radius: parameters.radius,
    width: parameters.width,
    rotation: parameters.rotation,
    patternRotation: parameters.patternRotation,
    segments: parameters.segments
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = shapeMapperJob;
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

      const int TYPE_STRETCH = 0;
      const int TYPE_CROP = 1;
      const int TYPE_TILE = 2;

      uniform vec2 resolution;
      uniform float seed;
      uniform int type;

      uniform sampler2D image;
      uniform bool imageSet;
      uniform vec2 imageSize;

      vec4 process (in vec2 uv, vec2 fragCoord) {
        if (type == TYPE_CROP) {
          if (imageSize.x > imageSize.y) {
            uv.x = (uv.x - 0.5) / imageSize.x * imageSize.y + 0.5;
          } else if (imageSize.x < imageSize.y) {
            uv.y = (uv.y - 0.5) / imageSize.y * imageSize.x + 0.5;
          }
        } else if (type == TYPE_TILE) {
          if (imageSize.x > imageSize.y) {
            uv.y = (uv.y - 0.5) * imageSize.x / imageSize.y + 0.5;
          } else if (imageSize.x < imageSize.y) {
            uv.x = (uv.x - 0.5) * imageSize.y / imageSize.x + 0.5;
          }

          uv = fract(uv);
        }

        return texture(image, uv);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;

          if (imageSet == true) {
            fragColor = process(uv, gl_FragCoord.xy);
          } else {
            fragColor = vec4(uv.x, uv.y, 0., 1.);
          }
      }

    `, {
      type: 'i',
      image: 't'
    });
  }

  return program;
}

function imageJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    type: parameters.type,
    image: parameters.image
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = imageJob;
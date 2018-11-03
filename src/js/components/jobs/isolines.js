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

      uniform int levels;
      uniform float offset;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;


      float sampleAndQuantizeHeightMap(vec2 uv, float offset, float levels) {
        vec3 base = texture(source, uv).rgb;

        float col = (base.r + base.g + base.b) / 3.;

        col = clamp(floor(col * levels + offset), 0., levels - 1.);

        return col;
      }

      float outline (vec2 uv, vec2 pixelSize, float offset, float levels) {
        float v = sampleAndQuantizeHeightMap(uv, offset, levels);

        float c = 0.;

        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(1., 0.), offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(-1., 0.), offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(0., 1.), offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(0., -1.), offset, levels)), 0., 1.);

        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(1., 1.) * 0.707, offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(1., -1.) * 0.707, offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(-1., -1.) * 0.707, offset, levels)), 0., 1.);
        c += clamp(distance(v, sampleAndQuantizeHeightMap(uv + pixelSize * vec2(-1., 1.) * 0.707, offset, levels)), 0., 1.);

        c = pow(clamp(c / 3.9, 0., 1.), 0.8);

        return c;
      }

      vec4 process (in vec2 uv) {
        vec2 pixelSize = vec2(1. / resolution.yy);

        float outline = outline(uv, pixelSize, offset, float(levels));

        return vec4(vec3(outline), 1.);
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
      levels: 'i',
      offset: 'f',
      source: 't'
    });
  }

  return program;
}

function sharpenJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    offset: parameters.offset,
    levels: parameters.levels
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = sharpenJob;
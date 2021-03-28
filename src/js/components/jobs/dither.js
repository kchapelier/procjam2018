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

      uniform float amount;
      uniform float offset;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec3 valveDither() {
        // based on Valve / Alex Vlachos dithering ( https://media.steampowered.com/apps/valve/2015/Alex_Vlachos_Advanced_VR_Rendering_GDC2015.pdf )
        vec3 vDither = vec3(dot(vec2(171.0, 231.0), gl_FragCoord.xy + offset));
        vDither.rgb = fract(vDither.rgb / vec3(103.0, 71.0, 97.0)) - vec3(0.5, 0.5, 0.5);

        return vDither;
      }

      vec4 process (in vec2 uv) {
        vec4 base = texture(source, uv);

        vec3 dither = valveDither() / 255.0 * amount;

        return vec4(clamp(base.rgb + dither, 0.0, 1.0), base.a);
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
      offset: 'f',
      source: 't'
    });
  }

  return program;
}

function ditherJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    amount: parameters.amount,
    offset: Math.random() * 99.
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = ditherJob;
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
      uniform float zoom;
      uniform float iterations;
      uniform vec2 center;
      uniform float parabolaFactor;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 process (in vec2 uv) {
        vec2 icenter = vec2(center.x, 1. - center.y);

        uv = uv - icenter;
        float a = atan(uv.y, uv.x);
        float l = length(uv);
        vec3 base = vec3(0.);

        float angleMultiplier = 6.283185307179586 * angle / iterations / 2.;
        float zoomMultiplier = zoom / iterations / 2.;
        float sumWeights = 0.;
        float k;
        float w;

        for (float i = -iterations; i <= iterations; i++) {
            k = (i + iterations) / (iterations * 2. + 0.00001);
            w = pow(4.0 * k * (1. - k), parabolaFactor); // inlined _parabola()
            float an = a + i * angleMultiplier;
            float ln = l + i * zoomMultiplier;
            uv.x = cos(an) * ln + icenter.x;
            uv.y = sin(an) * ln + icenter.y;

            base += texture(source, uv).rgb * w;
            sumWeights+=w;
        }

        base /= sumWeights;

        return vec4(base, 1.);
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
      angle: 'f',
      zoom: 'f',
      center: '2f',
      iterations: 'f',
      parabolaFactor: 'f'
    });
  }

  return program;
}

function radialBlurJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    angle: parameters.angle,
    zoom: parameters.zoom,
    center: parameters.center,
    iterations: parameters.iterations,
    parabolaFactor: parameters.parabolaFactor
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = radialBlurJob;
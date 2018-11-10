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

      const int SHAPE_SQUARE = 0;
      const int SHAPE_DISC = 1;
      const int SHAPE_PARABOLOID = 2;
      const int SHAPE_SINE = 3;
      const int SHAPE_LANCOSZ = 4;
      const int SHAPE_BLACKMANHARRIS = 5;
      const int SHAPE_GAUSSIAN = 6;
      const int SHAPE_THORN = 7;
      const int SHAPE_PYRAMID = 8;
      const int SHAPE_GRADATION = 9;
      const int SHAPE_WAVES = 10;
      const int SHAPE_CAPSULE = 11;
      const int SHAPE_CONE = 12;
      const int SHAPE_HEMISPHERE = 13;
      const int SHAPE_FIBER = 14;
      const int SHAPE_TRIANGLE = 15;
      const int SHAPE_TRIANGLE_PICK = 16;
      const int SHAPE_ELLIPSE2F = 17;
      const int SHAPE_ELLIPSE3F = 18;
      const int SHAPE_ELLIPSE4F = 19;
      const int SHAPE_ELLIPSE5F = 20;
      const int SHAPE_ROUND_SQUARE = 21;
      const int SHAPE_BICONVEX_LENS = 22;

      const int BLEND_MODE_ADDITIVE = 0;
      const int BLEND_MODE_MAX = 1;

      uniform bool rotate45;
      uniform int tiling;
      uniform float angle;
      uniform vec2 size;
      uniform float specific;
      uniform int shape;
      uniform int blendMode;

      const float _PI = 3.141592653589793;
      const float _EPSILON = 0.000001;
      const float _E = 2.718281828459045;

      float _sinc(float x) {
        return sin(x * _PI)/(x * _PI);
      }

      float pyramid (vec2 cuv) {
        return 1. - max(abs(cuv.x), abs(cuv.y));
      }

      float square (vec2 cuv) {
        return pyramid(cuv) > 0. ? 1. : 0.;
      }

      float cone (vec2 cuv) {
        return max(0., 1. - length(cuv));
      }

      float hemisphere(vec2 cuv) {
        float l = 1. - cuv.x * cuv.x - cuv.y * cuv.y;
        float z = l < 0. ? 0. : pow(l, 0.5);

        return clamp(z, 0., 1.);
      }

      float paraboloid (vec2 cuv) { //aka welch
        return max(0., 1. - pow(length(cuv), 2.));
      }

      float sine (vec2 cuv) {
        return sin(_PI * max(0., cone(cuv)) * 0.5);
      }

      float lancosz (vec2 cuv) {
        return _sinc(max(0., cone(cuv)) - 1.);
      }

      float blackmanHarris (vec2 cuv) {
        float n = max(0., cone(cuv));
        return 0.35875 - 0.48829 * cos(_PI * n) + 0.14128 * cos(2. * _PI * n) - 0.01168 * cos(3. * _PI * n);
      }

      float gaussian (vec2 cuv, float p) {
        float n = max(0., cone(cuv));
        return pow(2.718281828459045, -0.5 * pow((n - 1.) / (p * 0.5), 2.));
      }

      float disc (vec2 cuv) {
        return cone(cuv) > 0. ? 1. : 0.;
      }

      float thorn (vec2 cuv) {
        return pow(max(0., cone(cuv)), 4.);
      }

      float gradation (vec2 cuv) {
        return square(cuv) * (1. + cuv.x) * 0.5 * (1. - specific);
      }

      float waves (vec2 cuv) {
        float m = max(0. ,fract((1. + cuv.x * (1. + specific * 3.5)) * 1.5));
        return sine(cuv) * (1. - smoothstep(0., 1., abs(m - 0.5) * 2.));
      }

      float roundSquare (vec2 cuv) {
        float ispecific = max(_EPSILON, specific);
        float b = max(0., 1. - (length(max(abs(cuv)-vec2(1. - ispecific),0.0))) / (ispecific) + ispecific-1.*ispecific);
        return smoothstep(0., 0.01, b);// > 0. ? 1. : 0.;
      }

      float triangleDist( vec2 cuv )
      {
        vec2 h = vec2(0.665);
        vec2 p = cuv + vec2(0., 0.3333);
        vec2 q = abs(p);
        return 1. - max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5;
      }

      float triangle (vec2 cuv) {
        return triangleDist(cuv) > 0. ? 1. : 0.;
      }

      float trianglePick (vec2 cuv) {
        cuv.x = cuv.x * (mix(1., 1.35, specific)  + cuv.y * specific * 1.0);
        return smoothstep(0., 0.01, cone(cuv));
      }

      float capsule (vec2 cuv) {
        vec2 a = vec2(specific * 1.7, 0.);
        cuv.y = cuv.y * 2.;
        cuv.x = cuv.x * 2.;
        vec2 pa = cuv - a, ba = a * -2.;
        float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
        h = max(0., 1. - length( pa - ba*h ) - 0.5);

        return pow(h * 2., 0.4);
      }

      float fiber (vec2 cuv) {
        cuv.x /= mix(0.025, abs(cuv.y * specific) * 0.98 + 0.02, pow(abs(cuv.y) * 0.98 + 0.02, 0.5));
        cuv.x = abs(cuv.x) * -1.;
        return pow(cone(cuv), 2.);
      }

      float ellipse2f (vec2 cuv) {
        vec2 p1 = vec2(0., 0.5);
        vec2 p2 = vec2(0., -0.5);

        float dist = (
            distance(cuv, p2) +  distance(cuv, p1)
        );

        float min = distance(p1, p2) + specific * 0.5;

        return smoothstep(1., 1. - 0.0005, dist / min);
      }

      float ellipse3f (vec2 cuv) {
        vec2 p1 = vec2(0., 0.5);
        vec2 p2 = vec2(0.43301270189221935, -0.25);
        vec2 p3 = vec2(-0.43301270189221935, -0.25);

        float dist = (
            distance(cuv, p2) + distance(cuv, p3) + distance(cuv, p1)
        );

        float min = distance(p1, p2) + distance(p2, p3) + specific * 0.55 - 0.05;

        return smoothstep(1., 1. - 0.005, dist / min);
      }

      float ellipse4f (vec2 cuv) {
        vec2 p1 = vec2(0.5, 0.5);
        vec2 p2 = vec2(-0.5, 0.5);
        vec2 p3 = vec2(0.5, -0.5);
        vec2 p4 = vec2(-0.5, -0.5);

        float dist = (
            distance(cuv, p1) + distance(cuv, p2) + distance(cuv, p3) + distance(cuv, p4)
        );

        float min = distance(p1, p2) + distance(p1, p3) + distance(p1, p4) + specific * 0.65 - 0.05;

        return smoothstep(1., 1. - 0.005, dist / min);
      }

      float ellipse5f (vec2 cuv) {
        vec2 p1 = vec2(0.0, 0.5);
        vec2 p2 = vec2(0.47552825814757677, 0.15450849718747373);
        vec2 p3 = vec2(0.2938926261462366, -0.40450849718747367);
        vec2 p4 = vec2(-0.2938926261462365, -0.4045084971874737);
        vec2 p5 = vec2(-0.4755282581475768, 0.15450849718747361);

        float dist = (
            distance(cuv, p1) + distance(cuv, p2) + distance(cuv, p3) + distance(cuv, p4) + distance(cuv, p5)
        );

        float min = distance(p1, p2) + distance(p1, p3) + distance(p1, p4) + distance(p1, p5) + specific * 0.75 - 0.05;

        return smoothstep(1., 1. - 0.005, dist / min);
      }

      float biconvex_lens (vec2 cuv) {
        cuv.x = max(0.,abs(cuv.x)+ specific);
        cuv.y *= cos(specific * 1.);
        float dist = max(pow(cuv.y * cuv.y, 0.5), pow(cuv.x * cuv.x + cuv.y * cuv.y, 0.5));

        return smoothstep(1., 1. - 0.01, dist);
      }

      vec2 rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      float processStep (in vec2 uv, in vec2 offset) {
        if (rotate45 == true) {
          uv = rotate(uv - 0.5, -_PI / 4.) * 1.4142135623730951;
          uv = uv + 0.5;
        }

        vec2 cuv = (uv - 0.5) * 2.;
        cuv = (cuv / 2.) + 0.5;
        cuv = fract(cuv * float(tiling));
        cuv = cuv - 0.5 + offset;
        cuv = rotate(cuv, angle) * 2. / size;

        float v = 0.;

        if (shape == SHAPE_SQUARE) {
          v = square(cuv);
        } else if (shape == SHAPE_DISC) {
          v = disc(cuv);
        } else if (shape == SHAPE_PARABOLOID) {
          v = paraboloid(cuv);
        } else if (shape == SHAPE_LANCOSZ) {
          v = lancosz(cuv);
        } else if (shape == SHAPE_SINE) {
          v = sine(cuv);
        } else if (shape == SHAPE_BLACKMANHARRIS) {
          v = blackmanHarris(cuv);
        } else if (shape == SHAPE_GAUSSIAN) {
          v = gaussian(cuv, 0.5);
        } else if (shape == SHAPE_THORN) {
          v = thorn(cuv);
        } else if (shape == SHAPE_PYRAMID) {
          v = pyramid(cuv);
        } else if (shape == SHAPE_GRADATION) {
          v = gradation(cuv);
        } else if (shape == SHAPE_WAVES) {
          v = waves(cuv);
        } else if (shape == SHAPE_CAPSULE) {
          v = capsule(cuv);
        } else if (shape == SHAPE_CONE) {
          v = cone(cuv);
        } else if (shape == SHAPE_HEMISPHERE) {
          v = hemisphere(cuv);
        } else if (shape == SHAPE_FIBER) {
          v = fiber(cuv);
        } else if (shape == SHAPE_TRIANGLE) {
          v = triangle(cuv);
        } else if (shape == SHAPE_TRIANGLE_PICK) {
          v = trianglePick(cuv);
        } else if (shape == SHAPE_ELLIPSE2F) {
          v = ellipse2f(cuv);
        } else if (shape == SHAPE_ELLIPSE3F) {
          v = ellipse3f(cuv);
        } else if (shape == SHAPE_ELLIPSE4F) {
          v = ellipse4f(cuv);
        } else if (shape == SHAPE_ELLIPSE5F) {
          v = ellipse5f(cuv);
        } else if (shape == SHAPE_ROUND_SQUARE) {
          v = roundSquare(cuv);
        } else if (shape == SHAPE_BICONVEX_LENS) {
          v = biconvex_lens(cuv);
        }

        return clamp(v, 0., 1.);
      }

      vec4 process (in vec2 uv) {
        float value = 0.;

        for (float x = -3.; x <= 3.; x++)
        for (float y = -3.; y <= 3.; y++) {
          float v = processStep(uv, vec2(x, y));

          if (blendMode == BLEND_MODE_MAX) {
            value = max(value, v);
          } else {
            value+=v;
          }
        }

        return vec4(vec3(value), 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;
          fragColor = process(uv);
      }

    `, {
      tiling: 'i',
      shape: 'i',
      blendMode: 'i',
      rotate45: 'b',
      angle: 'f',
      size: '2f',
      specific: 'f'
    });
  }

  return program;
}

function shapeJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    tiling: parameters.tiling,
    shape: parameters.shape,
    blendMode: parameters.blendMode,
    rotate45: parameters.rotate45,
    angle: parameters.angle,
    size: parameters.size,
    specific: parameters.specific
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = shapeJob;
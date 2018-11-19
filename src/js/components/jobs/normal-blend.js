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

      const vec4 baseNormal = vec4(0.5, 0.5, 1., 1.);
      const vec4 baseGray = vec4(0.5, 0.5, 0.5, 1.);

      const int TYPE_LINEAR = 0;
      const int TYPE_OVERLAY = 1;
      const int TYPE_PARTIAL_DERIV = 2;
      const int TYPE_WHITEOUT = 3;
      const int TYPE_UDN = 4;
      const int TYPE_REORIENTED = 5;
      const int TYPE_UNITY = 6;

      uniform float opacity;
      uniform int type;

      uniform sampler2D background;
      uniform bool backgroundSet;
      uniform vec2 backgroundSize;

      uniform sampler2D foreground;
      uniform bool foregroundSet;
      uniform vec2 foregroundSize;

      uniform sampler2D mask;
      uniform bool maskSet;
      uniform vec2 maskSize;

      vec3 blendLinear(vec4 n1, vec4 n2, float opacity)
      {
          vec3 r = mix(n1.rgb, n2.rgb, 0.5 * opacity) * 2. - 1.;
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendOverlay(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseGray, n2, opacity);
          n1 = n1 * 4. - 2.;
          vec4 a = step(0., n1) * -2. + 1.;
          vec4 b = step(0., n1);
          n1 = 2. * a + n1;
          n2 = n2 * a + b;
          vec3 r = n1.rgb * n2.rgb - a.rgb;
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendPartialDeriv(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseNormal, n2, opacity);
          n1 = n1 * 2. - 1.;
          n2 = n2.rgbb * vec4(2., 2., 2., 0.) + vec4(-1., -1., -1., 0);
          vec3 r = n1.rgb * n2.b + n2.rga * n1.b;
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendWhiteout(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseNormal, n2, opacity);
          n1 = n1 * 2. - 1.;
          n2 = n2 * 2. - 1.;
          vec3 r = vec3(n1.xy + n2.xy, n1.b * n2.b);
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendUdn(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseNormal, n2, opacity);
          vec3 c = vec3(2., 1., 0.);
          vec3 r;
          r = n2.rgb * c.ggb + n1.rgb;
          r =  r * c.rrr -  c.rrg;
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendReoriented(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseNormal, n2, opacity);
          vec3 t = n1.rgb * vec3( 2.,  2., 2.) + vec3(-1., -1.,  0.);
          vec3 u = n2.rgb * vec3(-2., -2., 2.) + vec3( 1.,  1., -1.);
          vec3 r = t * dot(t, u) - u * t.b;
          return normalize(r) * 0.5 + 0.5;
      }

      vec3 blendUnity(vec4 n1, vec4 n2, float opacity)
      {
          n2 = mix(baseNormal, n2, opacity);
          n1 = n1.rgbb * vec4(2., 2., 2., -2.) + vec4(-1., -1., -1., 1.);
          n2 = n2 * 2. - 1.;
          vec3 r;
          r.x = dot(n1.brr,  n2.rgb);
          r.y = dot(n1.gbg,  n2.rgb);
          r.z = dot(n1.rga, -n2.rgb);
          return normalize(r) * 0.5 + 0.5;
      }

      vec4 process (in vec2 uv)
      {
        vec4 base = baseNormal;
        vec4 detail = baseNormal;

        if (backgroundSet == true) {
            base = texture(background, uv);
        }

        if (foregroundSet == true) {
            detail = texture(foreground, uv);
        }

        float iopacity = opacity;
        if (maskSet == true) {
          vec3 maskRgb = texture(mask, uv).rgb;
          iopacity = iopacity * (maskRgb.r + maskRgb.g + maskRgb.b) / 3.;
        }

        vec3 normal = baseNormal.rgb;

        if (type == TYPE_OVERLAY) {
            normal = blendOverlay(base, detail, iopacity);
        } else if (type == TYPE_PARTIAL_DERIV) {
            normal = blendPartialDeriv(base, detail, iopacity);
        } else if (type == TYPE_WHITEOUT) {
            normal = blendWhiteout(base, detail, iopacity);
        } else if (type == TYPE_UDN) {
            normal = blendUdn(base, detail, iopacity);
        } else if (type == TYPE_REORIENTED) {
            normal = blendReoriented(base, detail, iopacity);
        } else if (type == TYPE_UNITY) {
            normal = blendUnity(base, detail, iopacity);
        } else {
            normal = blendLinear(base, detail, iopacity);
        }

        return vec4(normal, 1.);
      }

      void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = process(uv);
      }

    `, {
      foreground: 't',
      background: 't',
      mask: 't',
      type: 'i',
      opacity: 'f'
    });
  }

  return program;
}

function normalBlendJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    foreground: inputs.detail,
    background: inputs.base,
    mask: inputs.mask,
    type: parameters.type,
    opacity: parameters.opacity
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = normalBlendJob;
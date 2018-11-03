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

      const float _PI = 3.141592653589793;

      uniform vec2 resolution;
      uniform float seed;

      uniform float size;
      uniform float smoothness;
      uniform float perturbationIntensity;
      uniform float gammaCorrection;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      uniform sampler2D perturbationMap;
      uniform bool perturbationMapSet;
      uniform vec2 perturbationMapSize;

      vec3 getMean (vec2 uv) {
        return vec3(0.);
      }

      vec4 process (in vec2 uv) {
        vec2 ouv = uv;

        vec3 cc = texture(source, ouv).rgb;
        vec3 ch = texture(source, ouv + vec2(0.5, 0.)).rgb;
        vec3 cv = texture(source, ouv + vec2(0., 0.5)).rgb;
        vec3 cd = texture(source, ouv + vec2(0.5)).rgb;

        float dc = clamp(1. - max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * (2. + (0.5 + size * 2.) / 4.), 0., 1.);

        float perturbationMask = 1. - max(abs(uv.x - 0.5), abs(uv.y - 0.5)) * (2. + (1. + size) / 6.);
        perturbationMask = mix(perturbationMask, 1. - distance(vec2(0.5, 0.5), uv) * 2., 0.02 + 0.98 * pow(perturbationMask, 0.9));
        perturbationMask = pow(clamp(perturbationMask, 0., 1.), 0.85);

        vec4 perturbationRgb = perturbationMapSet == true ? texture(perturbationMap, ouv) : (texture(source, ouv * 0.25) + texture(source, 0.5 + ouv * 0.15)) / 2.;

        uv = uv + pow(abs(vec2(
          sin(uv.x * _PI * 5. + cos(uv.y * _PI * 5.) * 2. * perturbationRgb.r),
          cos(uv.y * _PI * 5.5 + sin(uv.x * _PI * 4.8) * 2. * perturbationRgb.g)
        )), vec2(1.5)) * perturbationMask * 0.15 * perturbationIntensity;

        float dw = clamp((0.5 - uv.x) * 2., 0., 1.);
        dw = mix(dw, 1. - distance(uv * vec2(9.5 - size * 8., 1.), vec2(0., 0.5)) * 2., 1. - min(dw, 1. - abs(uv.y - 0.5) * 2.) );
        dw = pow(clamp(dw, 0., 1.), 0.8);

        float de = clamp((uv.x - 0.5) * 2., 0., 1.);
        de = mix(de, 1. - distance(uv * vec2(9.5 - size * 8., 1.), vec2(9.5 - size * 8., 0.5)) * 2., 1. - min(de, 1. - abs(uv.y - 0.5) * 2.));
        de = pow(clamp(de, 0., 1.), 0.8);

        float dn = clamp((uv.y - 0.5) * 2., 0., 1.);
        dn = mix(dn, 1. - distance(uv * vec2(1., 9.5 - size * 8.), vec2(0.5, 9.5 - size * 8.)) * 2., 1. - min(dn, 1. - abs(uv.x - 0.5) * 2.));
        dn = pow(clamp(dn, 0., 1.), 0.8);

        float ds = clamp((0.5 - uv.y) * 2., 0., 1.);
        ds = mix(ds, 1. - distance(uv * vec2(1., 9.5 - size * 8.), vec2(0.5, 0.)) * 2., 1. - min(ds, 1. - abs(uv.x - 0.5) * 2.));
        ds = pow(clamp(ds, 0., 1.), 0.8);

        float dsw = clamp(1. - max(abs(uv.x), abs(uv.y - 1.)) * (4.5 - size * 2.), 0., 1.);
        float dse = clamp(1. - max(abs(uv.x - 1.), abs(uv.y - 1.)) * (4.5 - size * 2.), 0., 1.);
        float dnw = clamp(1. - max(abs(uv.x), abs(uv.y)) * (4.5 - size * 2.), 0., 1.);
        float dne = clamp(1. - max(abs(uv.x - 1.), abs(uv.y)) * (4.5 - size * 2.), 0., 1.);

        float maxw = max(dc, max(
          max(max(dw, de), max(dn, ds)),
          max(max(dsw, dse), max(dnw, dne))
        ));
        float deltaw = mix(0.05, 0.9, smoothness);
        float basew = clamp(maxw - deltaw, 0., 1.);

        dc = clamp(dc - basew, 0., 1.);
        dn = clamp(dn - basew, 0., 1.);
        ds = clamp(ds - basew, 0., 1.);
        dw = clamp(dw - basew, 0., 1.);
        de = clamp(de - basew, 0., 1.);
        dne = clamp(dne - basew, 0., 1.);
        dse = clamp(dse - basew, 0., 1.);
        dnw = clamp(dnw - basew, 0., 1.);
        dsw = clamp(dsw - basew, 0., 1.);

        maxw = max(dc, max(
          max(max(dw, de), max(dn, ds)),
          max(max(dsw, dse), max(dnw, dne))
        ));

        float sumw = dc + dn + ds + dw + de + dne + dse + dnw + dsw;
        float sumw2 = sqrt(dc*dc + dn*dn + ds*ds + dw*dw + de*de + dne*dne + dse*dse + dnw*dnw + dsw*dsw);
        float v = pow(clamp((sumw - maxw), 0., 1.), 0.5);

        vec3 c = (
          cc * dc +
          cv * (ds + dn) + ch * (dw + de) +
          cd * (dse + dne + dsw + dnw)
        );

        vec3 mean = vec3(getMean(ouv));
        vec3 res = mean + (c-sumw*mean)/ sumw2;

        return vec4(mix(c/sumw, res, v * gammaCorrection), 1.);
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
      perturbationMap: 't',
      size: 'f',
      smoothness: 'f',
      perturbationIntensity: 'f',
      gammaCorrection: 'f'
    });
  }

  return program;
}

function makeTileableJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);

  var uniforms = {
    source: inputs.input,
    perturbationMap: inputs.perturbation,
    size: parameters.size,
    smoothness: parameters.smoothness,
    perturbationIntensity: parameters.perturbationIntensity,
    gammaCorrection: parameters.gammaCorrection
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = makeTileableJob;
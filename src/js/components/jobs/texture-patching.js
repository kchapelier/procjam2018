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

      const int ROTATION_NONE = 0;
      const int ROTATION_180 = 1;
      const int ROTATION_90 = 2;

      const int TYPE_CORNERS_AND_CENTER = 0;
      const int TYPE_CORNERS = 1;
      const int TYPE_JITTERED_GRID = 2;
      const int TYPE_PERTURBED_HEXAGONS = 3;

      uniform vec2 resolution;
      uniform float seed;

      uniform int tilesNumber;
      uniform float randomization;
      uniform float smoothness;
      uniform int rotation;
      uniform int type;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      float hash1 (const in vec2 n, const in float seed)
      {
        return fract(sin(dot(n + seed / 12.7,vec2(127.1, 311.7)))*(43758.5453 + seed*100.35));
      }

      float bias (const in float b, const in float t) {
        return pow(t, log(b) / log(0.5));
      }

      vec2 gain (const in float g, const in vec2 t) {
        vec2 nt = t;

        if (t.x < 0.5) {
          nt.x = bias(1.-g, 2.*t.x) / 2.;
        } else {
          nt.x = 1. - bias(1.-g, 2. - 2. * t.x) / 2.;
        }

        if (t.y < 0.5) {
          nt.y = bias(1.-g, 2.*t.y) / 2.;
        } else {
          nt.y = 1. - bias(1.-g, 2. - 2. * t.y) / 2.;
        }

        return nt;
      }

      vec3 clerp (const in vec3 p00, const in vec3 p10, const in vec3 p01, const in vec3 p11, const in vec2 t, in float smoothness) {
        smoothness = pow(smoothness, 1.33);
        vec2 pt = mix(
          mix(gain(0.995, t), t * t * t * (t * (t * 6. - 15.) + 10.), clamp(smoothness * 2., 0., 1.)),
          gain(0.45, smoothstep(0., 1., t)),
          clamp(smoothness * 2. - 1., 0., 1.)
        );

        return mix(mix(p00, p10, pt.x), mix(p01, p11, pt.x), pt.y);
      }


      vec3 plerp (const in vec3 p00, const in vec3 p10, const in vec3 p01, const in vec3 p11, const in vec2 t) {
        vec2 pt = t * t * t * (t * (t * 6. - 15.) + 10.);
        return mix(mix(p00, p10, pt.x), mix(p01, p11, pt.x), pt.y);
      }

      vec2 rotate (const in vec2 v, const in float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
      }

      vec3 floatToCol (const in float c, const in vec2 uv, const in float randomization, const in float angle) {
        vec2 offset = vec2(c * 10.17, c * 30.67);
        offset = mix(vec2((1. - randomization) / 2.), vec2((1. + randomization) / 2.), offset);
        return texture(source, rotate(uv, angle) + offset, -20.).rgb;
      }

      float getRotationAngle (const in int rotation, const in vec2 p, const in float seed) {
        if (rotation == ROTATION_180) {
          return floor(hash1(p, seed) * 2.) * _PI;
        } else if (rotation == ROTATION_90) {
          return floor(hash1(p, seed) * 4.) * _PI / 2.;
        }

        return 0.;
      }

      vec4 jittered (ivec2 puv, vec2 fuv, vec2 uv, float seed, float randomization, float smoothness, int rotation) {
        vec2 offset = vec2(
          hash1(mod(vec2(puv), float(tilesNumber)), seed),
          hash1(mod(vec2(puv), float(tilesNumber)), seed + 1.)
        );

        vec2 toffset = vec2(
          hash1(mod(vec2(puv), float(tilesNumber)), seed + 2.),
          hash1(mod(vec2(puv), float(tilesNumber)), seed + 3.)
        );

        float distance = clamp(2. + smoothness*0.5 - distance(fuv, offset) * (2. + smoothness*0.5), 0.01, 1.);

        float angle = getRotationAngle(rotation, mod(vec2(puv), float(tilesNumber)), seed + 5.);

        uv = rotate(uv, angle);
        return vec4(texture(source, uv + toffset * randomization, -50.).rgb, distance);
      }

      vec3 processCornerAndCenterMode (ivec2 puv, vec2 fuv, vec2 uv, float seed, float randomization, int rotation, float smoothness) {

        float itilesNumber = float(tilesNumber);

        float cb = mix(4., 1., smoothness);
        float cd = cb * 2.;
        float pb = mix(5., 2., smoothness);
        float pd = pb * 2. - 1.33 - smoothness * 0.33;

        float wc = clamp(cb - mix((abs(fuv.x - 0.5) + abs(fuv.y - 0.5)), distance(fuv, vec2(0.5)), .66) * cd, 0., 1.);
        vec3 cc = floatToCol(hash1(mod(vec2(puv), itilesNumber), seed + 2.), uv, randomization, getRotationAngle(rotation, mod(vec2(puv), itilesNumber), seed + 5.));

        float w00 = clamp(pb - mix((abs(fuv.x - 0.0) + abs(fuv.y - 0.0)), distance(fuv, vec2(0.0)), .33) * pd, 0., 1.);
        vec3 c00 = floatToCol(hash1(mod(vec2(puv + ivec2(0, 0)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 0)), itilesNumber), seed + 3.));
        float w10 = clamp(pb - mix((abs(fuv.x - 1.0) + abs(fuv.y - 0.0)), distance(fuv, vec2(1.0, 0.0)), .33) * pd, 0., 1.);
        vec3 c10 = floatToCol(hash1(mod(vec2(puv + ivec2(1, 0)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 0)), itilesNumber), seed + 3.));
        float w01 = clamp(pb - mix((abs(fuv.x - 0.0) + abs(fuv.y - 1.0)), distance(fuv, vec2(0.0, 1.0)), .33) * pd, 0., 1.);
        vec3 c01 = floatToCol(hash1(mod(vec2(puv + ivec2(0, 1)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 1)), itilesNumber), seed + 3.));
        float w11 = clamp(pb - mix((abs(fuv.x - 1.0) + abs(fuv.y - 1.0)), distance(fuv, vec2(1.0, 1.0)), .33) * pd, 0., 1.);
        vec3 c11 = floatToCol(hash1(mod(vec2(puv + ivec2(1, 1)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 1)), itilesNumber), seed + 3.));

        vec3 c = vec3(0.);
        float sumw = 0.;

        sumw += wc;
        c += cc * wc;
        sumw += w00;
        c += c00 * w00;
        sumw += w10;
        c += c10 * w10;
        sumw += w01;
        c += c01 * w01;
        sumw += w11;
        c += c11 * w11;

        if (sumw > 0.) {
          c /= sumw;
        }

        return c;
      }

      vec3 processCornerMode (ivec2 puv, vec2 fuv, vec2 uv, float seed, float randomization, int rotation, float smoothness) {

        float itilesNumber = float(tilesNumber);

        return clerp(
          floatToCol(hash1(mod(vec2(puv + ivec2(0, 0)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 0)), itilesNumber), seed + 3.)),
          floatToCol(hash1(mod(vec2(puv + ivec2(1, 0)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 0)), itilesNumber), seed + 3.)),
          floatToCol(hash1(mod(vec2(puv + ivec2(0, 1)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 1)), itilesNumber), seed + 3.)),
          floatToCol(hash1(mod(vec2(puv + ivec2(1, 1)), itilesNumber), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 1)), itilesNumber), seed + 3.)),
          fuv,
          smoothness
        );
      }

      vec3 processJitteredMode (ivec2 puv, vec2 fuv, vec2 uv, float seed, float randomization, int rotation, float smoothness) {

        vec4 dmm = jittered(puv + ivec2(-1, -1), fuv + vec2(1., 1.), uv, seed, randomization, smoothness, rotation);
        vec4 dm0 = jittered(puv + ivec2(-1, 0), fuv + vec2(1., 0.), uv, seed, randomization, smoothness, rotation);
        vec4 dmp = jittered(puv + ivec2(-1, 1), fuv + vec2(1., -1.), uv, seed, randomization, smoothness, rotation);

        vec4 d0m = jittered(puv + ivec2(0, -1), fuv + vec2(0., 1.), uv, seed, randomization, smoothness, rotation);
        vec4 d00 = jittered(puv, fuv, uv, seed, randomization, smoothness, rotation);
        vec4 d0p = jittered(puv + ivec2(0, 1), fuv + vec2(0., -1.), uv, seed, randomization, smoothness, rotation);

        vec4 dpm = jittered(puv + ivec2(1, -1), fuv + vec2(-1., 1.), uv, seed, randomization, smoothness, rotation);
        vec4 dp0 = jittered(puv + ivec2(1, 0), fuv + vec2(-1., 0.), uv, seed, randomization, smoothness, rotation);
        vec4 dpp = jittered(puv + ivec2(1, 1), fuv + vec2(-1., -1.), uv, seed, randomization, smoothness, rotation);

        vec3 c = vec3(0.);
        float sumw = 0.;

        float maxw = max(
          max(max(dmm.a, dm0.a), max(dmp.a, d00.a)),
          max(max(max(d0p.a,d0m.a),dpm.a),max(dp0.a,dpp.a))
        );

        float deltaw = mix(0.05, 0.9, smoothness);

        float basew = clamp(maxw - deltaw, 0., 1.);

        sumw = (
          clamp(dmm.a - basew, 0., 1.) + clamp(dm0.a - basew, 0., 1.) + clamp(dmp.a - basew, 0., 1.) +
          clamp(d0m.a - basew, 0., 1.) + clamp(d00.a - basew, 0., 1.) + clamp(d0p.a - basew, 0., 1.) +
          clamp(dpm.a - basew, 0., 1.) + clamp(dp0.a - basew, 0., 1.) + clamp(dpp.a - basew, 0., 1.)
        );


        c += (
          (dmm.rgb * clamp(dmm.a - basew, 0., 1.)) + (dm0.rgb * clamp(dm0.a - basew, 0., 1.)) + (dmp.rgb * clamp(dmp.a - basew, 0., 1.)) +
          (d0m.rgb * clamp(d0m.a - basew, 0., 1.)) + (d00.rgb * clamp(d00.a - basew, 0., 1.)) + (d0p.rgb * clamp(d0p.a - basew, 0., 1.)) +
          (dpm.rgb * clamp(dpm.a - basew, 0., 1.)) + (dp0.rgb * clamp(dp0.a - basew, 0., 1.)) + (dpp.rgb * clamp(dpp.a - basew, 0., 1.))
        );

        c /= sumw;

        return c;
      }

      vec3 processPerturbedHexagon (ivec2 puv, vec2 fuv, vec2 uv, float seed, float randomization, int rotation, float smoothness) {
        vec3 c = vec3(0.);

        vec2 perturbFuv = fuv;
        perturbFuv.x += sin(fuv.y*_PI*4. + seed*2.)*0.05;
        perturbFuv.y += cos(fuv.x*_PI*6. + seed)*0.05;

        vec3 cc = floatToCol(hash1(mod(vec2(puv), float(tilesNumber)), seed + 2.), uv, randomization, getRotationAngle(rotation, mod(vec2(puv), float(tilesNumber)), seed + 5.));
        float dc = clamp(1. - max((abs(perturbFuv.x - 0.5) + abs(fuv.y - 0.5)*1.666) * 1.666, abs(perturbFuv.x - 0.5)*3.) / 1.3, 0., 1.);

        float size = 1.5 + smoothness * 0.45;

        float wc00 = length(floatToCol(hash1(mod(vec2(puv + ivec2(0, 0)), float(tilesNumber)), seed + 8.), uv, randomization, 0.)) / 1.733;
        float d00 = clamp(1. - max((abs(perturbFuv.x - 0.0) + abs(perturbFuv.y - 0.0)*1.666) * 1.666, abs(perturbFuv.x - 0.0)*3.) / (size + wc00 * 0.5), 0., 1.);
        vec3 c00 = floatToCol(hash1(mod(vec2(puv + ivec2(0, 0)), float(tilesNumber)), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 0)), float(tilesNumber)), seed + 3.));

        float wc01 = length(floatToCol(hash1(mod(vec2(puv + ivec2(0, 1)), float(tilesNumber)), seed + 8.), uv, randomization, 0.)) / 1.733;
        float d01 = clamp(1. - max((abs(perturbFuv.x - 0.0) + abs(perturbFuv.y - 1.0)*1.666) * 1.666, abs(perturbFuv.x - 0.0)*3.) / (size + wc01 * 0.5), 0., 1.);
        vec3 c01 = floatToCol(hash1(mod(vec2(puv + ivec2(0, 1)), float(tilesNumber)), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(0, 1)), float(tilesNumber)), seed + 3.));

        float wc10 = length(floatToCol(hash1(mod(vec2(puv + ivec2(1, 0)), float(tilesNumber)), seed + 8.), uv, randomization, 0.)) / 1.733;
        float d10 = clamp(1. - max((abs(perturbFuv.x - 1.0) + abs(perturbFuv.y - 0.0)*1.666) * 1.666, abs(perturbFuv.x - 1.0)*3.) / (size + wc10 * 0.5), 0., 1.);
        vec3 c10 = floatToCol(hash1(mod(vec2(puv + ivec2(1, 0)), float(tilesNumber)), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 0)), float(tilesNumber)), seed + 3.));

        float wc11 = length(floatToCol(hash1(mod(vec2(puv + ivec2(1, 1)), float(tilesNumber)), seed + 8.), uv, randomization, 0.)) / 1.733;
        float d11 = clamp(1. - max((abs(perturbFuv.x - 1.0) + abs(perturbFuv.y - 1.0)*1.666) * 1.666, abs(perturbFuv.x - 1.0)*3.) / (size + wc11 * 0.5), 0., 1.);
        vec3 c11 = floatToCol(hash1(mod(vec2(puv + ivec2(1, 1)), float(tilesNumber)), seed), uv, randomization, getRotationAngle(rotation, mod(vec2(puv + ivec2(1, 1)), float(tilesNumber)), seed + 3.));

        float maxw = max(dc, max(max(d00, d01), max(d10, d11)));
        float deltaw = mix(0.05, 0.9, smoothness);
        float basew = clamp(maxw - deltaw, 0., 1.);

        float sumw = clamp(dc - basew, 0., 1.) + clamp(d00 - basew, 0., 1.) + clamp(d01 - basew, 0., 1.) + clamp(d10 - basew, 0., 1.) + clamp(d11 - basew, 0., 1.);

        c = (cc * clamp(dc - basew, 0., 1.) + c00 * clamp(d00 - basew, 0., 1.) + c01 * clamp(d01 - basew, 0., 1.) + c10 * clamp(d10 - basew, 0., 1.) + c11 * clamp(d11 - basew, 0., 1.)) / sumw;

        return c;

      }

      vec4 process (in vec2 uv) {
        vec2 fuv = fract(uv.xy * float(tilesNumber));
        ivec2 puv = ivec2(uv.xy * float(tilesNumber));

        vec3 c = vec3(0.);

        if (type == TYPE_CORNERS_AND_CENTER) {
            c = processCornerAndCenterMode(puv, fuv, uv, seed, randomization, rotation, smoothness);
        } else if (type == TYPE_CORNERS) {
            c = processCornerMode (puv, fuv, uv, seed, randomization, rotation, smoothness);
        } else if (type == TYPE_JITTERED_GRID) {
            c = processJitteredMode(puv, fuv, uv, seed, randomization, rotation, smoothness);
        } else if (type == TYPE_PERTURBED_HEXAGONS) {
            c = processPerturbedHexagon(puv, fuv, uv, seed, randomization, rotation, smoothness);
        }

        return vec4(c, 1.);
      }

      void main () {
          vec2 uv = gl_FragCoord.xy / resolution;

          if (sourceSet == true) {
            fragColor = process(uv);
          } else {
            fragColor = vec4(0., -0.3, 0., 1.);
          }
      }

    `, {
      source: 't',
      tilesNumber: 'i',
      rotation: 'i',
      type: 'i',
      seed: 'f',
      randomization: 'f',
      smoothness: 'f'
    });
  }

  return program;
}

function texturePatchingJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    tilesNumber: parameters.tilesNumber,
    rotation: parameters.rotation,
    type: parameters.type,
    seed: parameters.seed,
    randomization: parameters.randomization,
    smoothness: parameters.smoothness
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = texturePatchingJob;
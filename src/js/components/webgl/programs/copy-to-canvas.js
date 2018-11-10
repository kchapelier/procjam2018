"use strict";

var CopyToCanvasProgram = {
  instance: null
};

CopyToCanvasProgram.getInstance = function (context) {
  if (this.instance === null) {
    this.instance = context.createProgram(`#version 300 es

      precision highp float;
      precision highp int;
      precision highp sampler2D;

      layout(location = 0) out vec4 fragColor;

      uniform vec2 resolution;
      uniform float size;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec4 downSample (sampler2D sampler, vec2 uv, float level) {
        vec2 p = 1. / sourceSize;

        return (
          texture(sampler, uv) +
          texture(sampler, uv + vec2(1., 0.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(-1., 0.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(0., 1.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(0., -1.) * p * level) * 0.75 +

          texture(sampler, uv + vec2(1., 1.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(-1., 1.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(-1., -1.) * p * level) * 0.75 +
          texture(sampler, uv + vec2(1., -1.) * p * level) * 0.75 +

          texture(sampler, uv + vec2(1., 0.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(-1., 0.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(0., 1.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(0., -1.) * p * 2. * level) * 0.5 +

          texture(sampler, uv + vec2(1., 1.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(-1., 1.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(-1., -1.) * p * 2. * level) * 0.5 +
          texture(sampler, uv + vec2(1., -1.) * p * 2. * level) * 0.5
        ) / 11.;
      }

      void main () {
        if (gl_FragCoord.x >= size || gl_FragCoord.y >= size) {
          discard;
        }

        float scale = clamp(size / max(sourceSize.x, sourceSize.y), 0., 1.);
        scale = pow(clamp(1. - scale, 0., 1.), 1.5);
        fragColor = downSample(source, gl_FragCoord.xy / vec2(size), 1.);
        fragColor.a = 1.;
      }

    `, {
      source: 't',
      size: 'f'
    });
  }

  return this.instance;
};

module.exports = CopyToCanvasProgram;
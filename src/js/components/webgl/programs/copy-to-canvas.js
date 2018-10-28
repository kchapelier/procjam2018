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

      uniform sampler2D source;
      uniform float sourceSet;
      uniform vec2 sourceSize;

      vec4 downSample (sampler2D sampler, vec2 uv, float level) {
        vec2 p = 1. / resolution.xy;

        return (
          texture(sampler, uv, 0.) +
          texture(sampler, uv + vec2(1., 0.) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(-1., 0.) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(0., 1.) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(0., -1.) * p * level, 1.) * 0.5 +

          texture(sampler, uv + vec2(0.72, 0.72) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(-0.72, 0.72) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(-0.72, -0.72) * p * level, 1.) * 0.5 +
          texture(sampler, uv + vec2(0.72, -0.72) * p * level, 1.) * 0.5 +

          texture(sampler, uv + vec2(1., 0.) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(-1., 0.) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(0., 1.) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(0., -1.) * p * 2. * level, 1.) * 0.15 +

          texture(sampler, uv + vec2(0.72, 0.72) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(-0.72, 0.72) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(-0.72, -0.72) * p * 2. * level, 1.) * 0.15 +
          texture(sampler, uv + vec2(0.72, -0.72) * p * 2. * level, 1.) * 0.15
        ) / 6.2;
      }

      void main () {
        float scale = clamp(max(resolution.x, resolution.y) / max(sourceSize.x, sourceSize.y), 0., 1.);
        scale = pow(clamp(1. - scale, 0., 1.), 2.5) * 0.5;
        fragColor = downSample(source, gl_FragCoord.xy / resolution, scale);
        fragColor.a = 1.;
      }

    `, {
      source: 't'
    });
  }

  return this.instance;
};

module.exports = CopyToCanvasProgram;
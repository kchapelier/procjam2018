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

      const int TYPE_RGB = 0;
      const int TYPE_HSV = 1;
      const int TYPE_HSL = 2;
      const int TYPE_HSLUV = 3;
      const int TYPE_LCH = 4;
      const int TYPE_YUV = 5;
      const int TYPE_YCBCR = 6;
      const int TYPE_CMY = 7;

      uniform vec2 resolution;
      uniform float seed;

      uniform int sourceType;
      uniform int outputType;

      uniform sampler2D source;
      uniform bool sourceSet;
      uniform vec2 sourceSize;

      vec3 hsluv_intersectLineLine(vec3 line1x, vec3 line1y, vec3 line2x, vec3 line2y) {
        return (line1y - line2y) / (line2x - line1x);
      }

      vec3 hsluv_distanceFromPole(vec3 pointx,vec3 pointy) {
        return sqrt(pointx*pointx + pointy*pointy);
      }

      vec3 hsluv_lengthOfRayUntilIntersect(float theta, vec3 x, vec3 y) {
        vec3 len = y / (sin(theta) - x * cos(theta));
        if (len.r < 0.0) {len.r=1000.0;}
        if (len.g < 0.0) {len.g=1000.0;}
        if (len.b < 0.0) {len.b=1000.0;}
        return len;
      }

      float hsluv_maxSafeChromaForL(float L){
        mat3 m2 = mat3(
           3.2409699419045214  ,-0.96924363628087983 , 0.055630079696993609,
          -1.5373831775700935  , 1.8759675015077207  ,-0.20397695888897657 ,
          -0.49861076029300328 , 0.041555057407175613, 1.0569715142428786
        );

        float sub0 = L + 16.0;
        float sub1 = sub0 * sub0 * sub0 * .000000641;
        float sub2 = sub1 > 0.0088564516790356308 ? sub1 : L / 903.2962962962963;

        vec3 top1   = (284517.0 * m2[0] - 94839.0  * m2[2]) * sub2;
        vec3 bottom = (632260.0 * m2[2] - 126452.0 * m2[1]) * sub2;
        vec3 top2   = (838422.0 * m2[2] + 769860.0 * m2[1] + 731718.0 * m2[0]) * L * sub2;

        vec3 bounds0x = top1 / bottom;
        vec3 bounds0y = top2 / bottom;

        vec3 bounds1x =              top1 / (bottom+126452.0);
        vec3 bounds1y = (top2-769860.0*L) / (bottom+126452.0);

        vec3 xs0 = hsluv_intersectLineLine(bounds0x, bounds0y, -1.0/bounds0x, vec3(0.0) );
        vec3 xs1 = hsluv_intersectLineLine(bounds1x, bounds1y, -1.0/bounds1x, vec3(0.0) );

        vec3 lengths0 = hsluv_distanceFromPole( xs0, bounds0y + xs0 * bounds0x );
        vec3 lengths1 = hsluv_distanceFromPole( xs1, bounds1y + xs1 * bounds1x );

        return  min(lengths0.r,
                min(lengths1.r,
                min(lengths0.g,
                min(lengths1.g,
                min(lengths0.b,
                    lengths1.b)))));
      }

      float hsluv_maxChromaForLH(float L, float H) {

        float hrad = radians(H);

        mat3 m2 = mat3(
           3.2409699419045214  ,-0.96924363628087983 , 0.055630079696993609,
          -1.5373831775700935  , 1.8759675015077207  ,-0.20397695888897657 ,
          -0.49861076029300328 , 0.041555057407175613, 1.0569715142428786
        );

        float sub1 = pow(L + 16.0, 3.0) / 1560896.0;
        float sub2 = sub1 > 0.0088564516790356308 ? sub1 : L / 903.2962962962963;

        vec3 top1   = (284517.0 * m2[0] - 94839.0  * m2[2]) * sub2;
        vec3 bottom = (632260.0 * m2[2] - 126452.0 * m2[1]) * sub2;
        vec3 top2   = (838422.0 * m2[2] + 769860.0 * m2[1] + 731718.0 * m2[0]) * L * sub2;

        vec3 bound0x = top1 / bottom;
        vec3 bound0y = top2 / bottom;

        vec3 bound1x =              top1 / (bottom+126452.0);
        vec3 bound1y = (top2-769860.0*L) / (bottom+126452.0);

        vec3 lengths0 = hsluv_lengthOfRayUntilIntersect(hrad, bound0x, bound0y );
        vec3 lengths1 = hsluv_lengthOfRayUntilIntersect(hrad, bound1x, bound1y );

        return  min(lengths0.r,
                min(lengths1.r,
                min(lengths0.g,
                min(lengths1.g,
                min(lengths0.b,
                    lengths1.b)))));
      }

      float hsluv_fromLinear(float c) {
        return c <= 0.0031308 ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055;
      }

      vec3 hsluv_fromLinear(vec3 c) {
        return vec3( hsluv_fromLinear(c.r), hsluv_fromLinear(c.g), hsluv_fromLinear(c.b) );
      }

      float hsluv_toLinear(float c) {
        return c > 0.04045 ? pow((c + 0.055) / (1.0 + 0.055), 2.4) : c / 12.92;
      }

      vec3 hsluv_toLinear(vec3 c) {
        return vec3( hsluv_toLinear(c.r), hsluv_toLinear(c.g), hsluv_toLinear(c.b) );
      }

      float hsluv_yToL(float Y){
        return Y <= 0.0088564516790356308 ? Y * 903.2962962962963 : 116.0 * pow(Y, 1.0 / 3.0) - 16.0;
      }

      float hsluv_lToY(float L) {
        return L <= 8.0 ? L / 903.2962962962963 : pow((L + 16.0) / 116.0, 3.0);
      }

      vec3 xyzToRgb(vec3 tuple) {
        const mat3 m = mat3(
            3.2409699419045214  ,-1.5373831775700935 ,-0.49861076029300328 ,
           -0.96924363628087983 , 1.8759675015077207 , 0.041555057407175613,
            0.055630079696993609,-0.20397695888897657, 1.0569715142428786  );

        return hsluv_fromLinear(tuple*m);
      }

      vec3 rgbToXyz(vec3 tuple) {
        const mat3 m = mat3(
            0.41239079926595948 , 0.35758433938387796, 0.18048078840183429 ,
            0.21263900587151036 , 0.71516867876775593, 0.072192315360733715,
            0.019330818715591851, 0.11919477979462599, 0.95053215224966058
        );

        return hsluv_toLinear(tuple) * m;
      }

      vec3 xyzToLuv(vec3 tuple){
        float X = tuple.x;
        float Y = tuple.y;
        float Z = tuple.z;

        float L = hsluv_yToL(Y);

        float div = 1./dot(tuple,vec3(1,15,3));

        return vec3(
            1.,
            (52. * (X*div) - 2.57179),
            (117.* (Y*div) - 6.08816)
        ) * L;
      }

      vec3 luvToXyz(vec3 tuple) {
        float L = tuple.x;

        float U = tuple.y / (13.0 * L) + 0.19783000664283681;
        float V = tuple.z / (13.0 * L) + 0.468319994938791;

        float Y = hsluv_lToY(L);
        float X = 2.25 * U * Y / V;
        float Z = (3./V - 5.)*Y - (X/3.);

        return vec3(X, Y, Z);
      }

      vec3 luvToLch(vec3 tuple) {
        float L = tuple.x;
        float U = tuple.y;
        float V = tuple.z;

        float C = length(tuple.yz);
        float H = degrees(atan(V,U));
        if (H < 0.0) {
          H = 360.0 + H;
        }

        return vec3(L, C, H);
      }

      vec3 lchToLuv(vec3 tuple) {
        float hrad = radians(tuple.b);
        return vec3(
          tuple.r,
          cos(hrad) * tuple.g,
          sin(hrad) * tuple.g
        );
      }

      vec3 hsluvToLch(vec3 tuple) {
        tuple.g *= hsluv_maxChromaForLH(tuple.b, tuple.r) * .01;
        return tuple.bgr;
      }

      vec3 lchToHsluv(vec3 tuple) {
        tuple.g /= hsluv_maxChromaForLH(tuple.r, tuple.b) * .01;
        return tuple.bgr;
      }

      vec3 lchToRgb(vec3 tuple) {
        return xyzToRgb(luvToXyz(lchToLuv(tuple)));
      }

      vec3 rgbToLch(vec3 tuple) {
        return luvToLch(xyzToLuv(rgbToXyz(tuple)));
      }

      vec3 _hsluv2rgb(vec3 hsluv) {
        return lchToRgb(hsluvToLch(hsluv * vec3(360., 100., 100.)));
      }

      vec3 _rgb2hsluv(vec3 rgb) {
        return lchToHsluv(rgbToLch(rgb)) / vec3(360., 100., 100.);
      }

      vec3 _rgb2lch(vec3 rgb) {
        return clamp(rgbToLch(rgb) / vec3(100., 100., 360.), 0., 1.);
      }

      vec3 _lch2rgb(vec3 lch) {
        return clamp(lchToRgb(lch * vec3(100., 100., 360.)), 0., 1.);
      }

      vec3 _rgb2yuv (vec3 rgb) {
        return vec3(
          0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b,
          -0.14713 * rgb.r - 0.28886 * rgb.g + 0.436 * rgb.b,
          0.615 * rgb.r - 0.51498 * rgb.g - 0.10001 * rgb.b
        );
      }

      vec3 _yuv2rgb (vec3 yuv) {
        return vec3(
          yuv.r + 1.13983 * yuv.b,
          yuv.r - 0.39465 * yuv.g - 0.58060 * yuv.b,
          yuv.r + 2.03211 * yuv.g
        );
      }

      vec3 _rgb2ycbcr (vec3 rgb) {
        return vec3(
          0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b,
          -0.1687 * rgb.r - 0.3313 * rgb.g + 0.5 * rgb.b + 128. / 255.,
          0.5 * rgb.r - 0.4187 * rgb.g - 0.0813 * rgb.b + 128. / 255.
        );
      }

      vec3 _ycbcr2rgb (vec3 ycbcr) {
        return vec3(
          ycbcr.r + 1.402 * (ycbcr.b - 128. / 255.),
          ycbcr.r - 0.34414 * (ycbcr.g - 128. / 255.) - 0.71414 * (ycbcr.b - 128. / 255.),
          ycbcr.r + 1.772 * (ycbcr.g - 128. / 255.)
        );
      }

      const float eps = 0.0000001;

      vec3 _hsv2rgb( in vec3 c )
      {
        vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return c.z * mix( vec3(1.0), rgb, c.y);
      }

      vec3 _hsl2rgb( in vec3 c )
      {
        vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
        return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
      }

      vec3 _rgb2hsv( in vec3 c)
      {
        vec4 k = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0);
        vec4 p = mix(vec4(c.zy, k.wz), vec4(c.yz, k.xy), (c.z<c.y) ? 1.0 : 0.0);
        vec4 q = mix(vec4(p.xyw, c.x), vec4(c.x, p.yzx), (p.x<c.x) ? 1.0 : 0.0);
        float d = q.x - min(q.w, q.y);
        return vec3(abs(q.z + (q.w - q.y) / (6.0*d+eps)), d / (q.x+eps), q.x);
      }

      vec3 _rgb2hsl( vec3 col )
      {
        float minc = min( col.r, min(col.g, col.b) );
        float maxc = max( col.r, max(col.g, col.b) );
        vec3  mask = step(col.grr,col.rgb) * step(col.bbg,col.rgb);
        vec3 h = mask * (vec3(0.0,2.0,4.0) + (col.gbr-col.brg)/(maxc-minc + eps)) / 6.0;
        return vec3( fract( 1.0 + h.x + h.y + h.z ),              // H
                     (maxc-minc)/(1.0-abs(minc+maxc-1.0) + eps),  // S
                     (minc+maxc)*0.5 );                           // L
      }

      vec3 _rgb2cmy (vec3 col) {
        return 1. - col;
      }

      vec3 _cmy2rgb (vec3 col) {
        return 1. - col;
      }

      vec4 process (in vec2 uv) {
        vec3 color = texture(source, uv).rgb;

        if (sourceType != outputType) {
          if (sourceType == TYPE_YUV) {
            color = _yuv2rgb(color);
          } else if (sourceType == TYPE_YCBCR) {
            color = _ycbcr2rgb(color);
          } else if (sourceType == TYPE_HSV) {
            color = _hsv2rgb(color);
          } else if (sourceType == TYPE_HSL) {
            color = _hsl2rgb(color);
          } else if (sourceType == TYPE_HSLUV) {
            color = _hsluv2rgb(color);
          } else if (sourceType == TYPE_LCH) {
            color = _lch2rgb(color);
          } else if (sourceType == TYPE_CMY) {
            color = _cmy2rgb(color);
          }

          if (outputType == TYPE_YUV) {
            color = _rgb2yuv(color);
          } else if (outputType == TYPE_YCBCR) {
            color = _rgb2ycbcr(color);
          } else if (outputType == TYPE_HSV) {
            color = _rgb2hsv(color);
          } else if (outputType == TYPE_HSL) {
            color = _rgb2hsl(color);
          } else if (outputType == TYPE_HSLUV) {
            color = _rgb2hsluv(color);
          } else if (outputType == TYPE_LCH) {
            color = _rgb2lch(color);
          } else if (outputType == TYPE_CMY) {
            color = _rgb2cmy(color);
          }
        }

        return vec4(clamp(color, 0., 1.), 1.);
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
      sourceType: 'i',
      outputType: 'i',
      source: 't'
    });
  }

  return program;
}

function colorspaceConversionJob (context, inputs, outputs, parameters, done) {
  var program = getProgram(context);
  var uniforms = {
    source: inputs.input,
    sourceType: parameters.sourceType,
    outputType: parameters.outputType
  };

  program.execute(uniforms, outputs.output);

  done();
}

module.exports = colorspaceConversionJob;
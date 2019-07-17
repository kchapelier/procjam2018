"use strict";

const TypeProvider = require('./types-provider');
const { extendClass } = require('./../../commons/utils');

var AnisotropicNoiseParameters = require('./../parameters/anisotropic-noise-parameters');
var AnisotropicBlurParameters = require('./../parameters/anisotropic-blur-parameters');
var BlendParameters = require('./../parameters/blend-parameters');
var BricksParameters = require('./../parameters/bricks-parameters');
var BrightnessContrastParameters = require('./../parameters/brightness-contrast-parameters');
var CellularNoiseParameters = require('./../parameters/cellular-noise-parameters');
var ClampParameters = require('./../parameters/clamp-parameters');
var ChannelShuffleParameters = require('./../parameters/channel-shuffle-parameters');
var CheckersParameters = require('./../parameters/checkers-parameters');
var ColorToMaskParameters = require('./../parameters/color-to-mask-parameters');
var ColorspaceConversionParameters = require('./../parameters/colorspace-conversion-parameters');
var DirectionalBlurParameters = require('./../parameters/directional-blur-parameters');
var DirectionalWarpParameters = require('./../parameters/directional-warp-parameters');
var EdgeDetectParameters = require('./../parameters/edge-detect-parameters');
var EmbossParameters = require('./../parameters/emboss-parameters');
var FastMazeParameters = require('./../parameters/fast-maze-parameters');
var FixMaskParameters = require('./../parameters/fix-mask-parameters');
var GaussianBlurParameters = require('./../parameters/gaussian-blur-parameters');
var GradientMapParameters = require('./../parameters/gradient-map-parameters');
var GradientNoiseParameters = require('./../parameters/gradient-noise-parameters');
var GradientNoiseFractalParameters = require('./../parameters/gradient-noise-fractal-parameters');
var GrayscaleConversionParameters = require('./../parameters/grayscale-conversion-parameters');
var HeightToNormalParameters = require('./../parameters/height-to-normal-parameters');
var HslShiftParameters = require('./../parameters/hsl-shift-parameters');
var ImageParameters = require('./../parameters/image-parameters');
var InvertParameters = require('./../parameters/invert-parameters');
var IsolinesParameters = require('./../parameters/isolines-parameters');
var JitterFilterParameters = require('./../parameters/jitter-filter-parameters');
var KaleidoscopeParameters = require('./../parameters/kaleidoscope-parameters');
var LinearGradientParameters = require('./../parameters/linear-gradient-2-parameters');
var MakeTileableParameters = require('./../parameters/make-tileable-parameters');
var MirrorParameters = require('./../parameters/mirror-parameters');
var NoParameters = require('./../parameters/no-parameters');
var NormalBlendParameters = require('./../parameters/normal-blend-parameters');
var NormalBlurParameters = require('./../parameters/normal-blur-parameters');
var NormalInvertParameters = require('./../parameters/normal-invert-parameters');
var NormalRotateParameters = require('./../parameters/normal-rotate-parameters');
var NormalTweakParameters = require('./../parameters/normal-tweak-parameters');
var OctaveSumParameters = require('./../parameters/octave-sum-parameters');
var PosterizeParameters = require('./../parameters/posterize-parameters');
var PowParameters = require('./../parameters/pow-parameters');
var RadialBlurParameters = require('./../parameters/radial-blur-parameters');
var SelectiveBlurParameters = require('./../parameters/selective-blur-parameters');
var ShapeParameters = require('./../parameters/shape-parameters');
var ShapeMapperParameters = require('./../parameters/shape-mapper-parameters');
var SharpenParameters = require('./../parameters/sharpen-parameters');
var SkewParameters = require('./../parameters/skew-parameters');
var SolarizeParameters = require('./../parameters/solarize-parameters');
var TexturePatchingParameters = require('./../parameters/texture-patching-parameters');
var Transform2dParameters = require('./../parameters/transform-2d-parameters');
var UniformColorParameters = require('./../parameters/uniform-color-parameters');
var UniformGrayscaleParameters = require('./../parameters/uniform-gray-parameters');
var ValueNoiseParameters = require('./../parameters/value-noise-parameters');
var ValueNoiseFractalParameters = require('./../parameters/value-noise-fractal-parameters');
var VibranceParameters = require('./../parameters/vibrance-parameters');
var WarpParameters = require('./../parameters/warp-parameters');

var anisotropicBlurJob = require('./../jobs/anisotropic-blur');
var anisotropicNoiseJob = require('./../jobs/anisotropic-noise');
var blendJob = require('./../jobs/blend');
var bricksJob = require('./../jobs/bricks');
var brightnessContrastJob = require('./../jobs/brightness-contrast');
var cartesianToPolarJob = require('./../jobs/cartesian-to-polar');
var cellularNoiseJob = require('./../jobs/cellular-noise');
var channelMergeJob = require('./../jobs/channel-merge');
var channelShuffleJob = require('./../jobs/channel-shuffle');
var channelSplitterJob = require('./../jobs/channel-splitter');
var clampJob = require('./../jobs/clamp');
var checkersJob = require('./../jobs/checkers');
var colorToMaskJob = require('./../jobs/color-to-mask');
var colorspaceConversionJob = require('./../jobs/colorspace-conversion');
var directionalBlurJob = require('./../jobs/directional-blur');
var directionalWarpJob = require('./../jobs/directional-warp');
var edgeDetectJob = require('./../jobs/edge-detect');
var embossJob = require('./../jobs/emboss');
var fastMazeJob = require('./../jobs/fast-maze');
var fixMaskJob = require('./../jobs/fix-mask');
var gaussianBlurJob = require('./../jobs/gaussian-blur');
var gradientMapJob = require('./../jobs/gradient-map');
var gradientNoiseJob = require('./../jobs/gradient-noise');
var gradientNoiseFractalJob = require('./../jobs/gradient-noise-fractal');
var grayscaleConversionJob = require('./../jobs/grayscale-conversion');
var heightToNormalJob = require('./../jobs/height-to-normal');
var hslShiftJob = require('./../jobs/hsl-shift');
var imageJob = require('./../jobs/image');
var invertJob = require('./../jobs/invert');
var isolinesJob = require('./../jobs/isolines');
var jitterFilterJob = require('./../jobs/jitter-filter');
var kaleidoscopeJob = require('./../jobs/kaleidoscope');
var linearGradientJob = require('./../jobs/linear-gradient-2');
var makeTileableJob = require('./../jobs/make-tileable');
var mirrorJob = require('./../jobs/mirror');
var normalizeJob = require('./../jobs/normalize');
var normalBlendJob = require('./../jobs/normal-blend');
var normalBlurJob = require('./../jobs/normal-blur');
var normalInvertJob = require('./../jobs/normal-invert');
var normalRotateJob = require('./../jobs/normal-rotate');
var normalTweakJob = require('./../jobs/normal-tweak');
var octaveSumJob = require('./../jobs/octave-sum');
var polarToCartesianJob = require('./../jobs/polar-to-cartesian');
var posterizeJob = require('./../jobs/posterize');
var powJob = require('./../jobs/pow');
var radialBlurJob = require('./../jobs/radial-blur');
var selectiveBlurJob = require('./../jobs/selective-blur');
var shapeJob = require('./../jobs/shape');
var shapeMapperJob = require('./../jobs/shape-mapper');
var sharpenJob = require('./../jobs/sharpen');
var skewJob = require('./../jobs/skew');
var solarizeJob = require('./../jobs/solarize');
var texturePatchingJob = require('./../jobs/texture-patching');
var transform2dJob = require('./../jobs/transform-2d');
var uniformColorJob = require('./../jobs/uniform-color');
var valueNoiseJob = require('./../jobs/value-noise');
var valueNoiseFractalJob = require('./../jobs/value-noise-fractal');
var vibranceJob = require('./../jobs/vibrance');
var warpJob = require('./../jobs/warp');

function PopulatedTypeProvider () {
  this.constructor.super.call(this);

  this.populate();
}

extendClass(PopulatedTypeProvider, TypeProvider);

PopulatedTypeProvider.prototype.populate = function () {
  this.registerType({
    isFilter: false,
    id: 'anisotropic-noise',
    name: 'Anisotropic Noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: AnisotropicNoiseParameters,
    job: anisotropicNoiseJob
  });

  this.registerType({
    isFilter: false,
    id: 'bricks',
    name: 'Bricks',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: BricksParameters,
    job: bricksJob
  });

  this.registerType({
    isFilter: true,
    id: 'cartesian-to-polar',
    name: 'Cartesian to Polar',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: cartesianToPolarJob
  });

  this.registerType({
    isFilter: true,
    id: 'channel-shuffle',
    name: 'Channel Shuffle',
    inputs: [ 'input1', 'input2', 'input3' ],
    outputs: [ 'output' ],
    parameters: ChannelShuffleParameters,
    job: channelShuffleJob
  });

  this.registerType({
    isFilter: true,
    id: 'channel-splitter',
    name: 'Channel Splitter',
    inputs: [ 'input' ],
    outputs: [ 'channel1', 'channel2', 'channel3' ],
    parameters: NoParameters,
    job: channelSplitterJob
  });

  this.registerType({
    isFilter: true,
    id: 'channel-merge',
    name: 'Channel Merge',
    inputs: [ 'channel1', 'channel2', 'channel3' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: channelMergeJob
  });

  this.registerType({
    isFilter: false,
    id: 'checkers',
    name: 'Checkers',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: CheckersParameters,
    job: checkersJob
  });

  this.registerType({
    isFilter: false,
    id: 'fast-maze',
    name: 'Fast Maze',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: FastMazeParameters,
    job: fastMazeJob
  });

  this.registerType({
    isFilter: true,
    id: 'gaussian-blur',
    name: 'Gaussian Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: GaussianBlurParameters,
    job: gaussianBlurJob
  });

  this.registerType({
    isFilter: false,
    id: 'gradient-noise',
    name: 'Gradient Noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseParameters,
    job: gradientNoiseJob
  });

  this.registerType({
    isFilter: false,
    id: 'gradient-noise-fractal',
    name: 'Gradient Noise (fractal sum)',
    keywords: [ 'fbm' ],
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseFractalParameters,
    job: gradientNoiseFractalJob
  });

  this.registerType({
    isFilter: false,
    id: 'image',
    name: 'Image',
    keywords: [ 'bitmap', 'picture' ],
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ImageParameters,
    job: imageJob
  });

  this.registerType({
    isFilter: true,
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    inputs: [ 'input', 'distortion' ],
    outputs: [ 'output' ],
    parameters: KaleidoscopeParameters,
    job: kaleidoscopeJob
  });

  this.registerType({
    isFilter: false,
    id: 'linear-gradient',
    name: 'Linear Gradient',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: LinearGradientParameters,
    job: linearGradientJob
  });

  this.registerType({
    isFilter: true,
    id: 'polar-to-cartesian',
    name: 'Polar to Cartesian',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: polarToCartesianJob
  });

  this.registerType({
    isFilter: true,
    id: 'radial-blur',
    name: 'Radial Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: RadialBlurParameters,
    job: radialBlurJob
  });

  this.registerType({
    isFilter: true,
    id: 'selective-blur',
    name: 'Selective Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SelectiveBlurParameters,
    job: selectiveBlurJob
  });

  this.registerType({
    isFilter: false,
    id: 'shape',
    name: 'Shape',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ShapeParameters,
    job: shapeJob
  });

  this.registerType({
    isFilter: false,
    id: 'uniform-color',
    name: 'Uniform Color',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: UniformColorParameters,
    job: uniformColorJob
  });

  this.registerType({
    isFilter: false,
    id: 'uniform-grayscale',
    name: 'Uniform Grayscale',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: UniformGrayscaleParameters,
    job: uniformColorJob
  });

  this.registerType({
    isFilter: false,
    id: 'value-noise',
    name: 'Value Noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseParameters,
    job: valueNoiseJob
  });

  this.registerType({
    isFilter: false,
    id: 'value-noise-fractal',
    name: 'Value Noise (fractal sum)',
    keywords: [ 'fbm' ],
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseFractalParameters,
    job: valueNoiseFractalJob
  });





  this.registerType({
    isFilter: true,
    id: 'anisotropic-blur',
    name: 'Anisotropic Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: AnisotropicBlurParameters,
    job: anisotropicBlurJob
  });

  this.registerType({
    isFilter: true,
    id: 'blend',
    name: 'Blend',
    inputs: [ 'background', 'foreground', 'mask' ],
    outputs: [ 'output' ],
    parameters: BlendParameters,
    job: blendJob
  });

  this.registerType({
    isFilter: true,
    id: 'brightness-contrast',
    name: 'Brightness and Contrast',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: BrightnessContrastParameters,
    job: brightnessContrastJob
  });

  this.registerType({
    isFilter: false,
    id: 'cellular-noise',
    name: 'Cellular Noise',
    inputs: [],
    outputs: [ 'output' ],
    parameters: CellularNoiseParameters,
    job: cellularNoiseJob
  });

  this.registerType({
    isFilter: true,
    id: 'clamp',
    name: 'Clamp',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ClampParameters,
    job: clampJob
  });

  this.registerType({
    isFilter: true,
    id: 'color-to-mask',
    name: 'Color to Mask',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorToMaskParameters,
    job: colorToMaskJob
  });

  this.registerType({
    isFilter: true,
    id: 'colorspace-conversion',
    name: 'Colorspace Conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorspaceConversionParameters,
    job: colorspaceConversionJob
  });

  this.registerType({
    isFilter: true,
    id: 'directional-blur',
    name: 'Directional Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: DirectionalBlurParameters,
    job: directionalBlurJob
  });

  this.registerType({
    isFilter: true,
    id: 'directional-warp',
    name: 'Directional Warp',
    keywords: [ 'wrap' ],
    inputs: [ 'input', 'intensity', 'angle' ],
    outputs: [ 'output' ],
    parameters: DirectionalWarpParameters,
    job: directionalWarpJob
  });

  this.registerType({
    isFilter: true,
    id: 'edge-detect',
    name: 'Edge Detect',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: EdgeDetectParameters,
    job: edgeDetectJob
  });

  this.registerType({
    isFilter: true,
    id: 'emboss',
    name: 'Emboss',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: EmbossParameters,
    job: embossJob
  });

  this.registerType({
    isFilter: true,
    id: 'fix-mask',
    name: 'Fix Mask',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: FixMaskParameters,
    job: fixMaskJob
  });

  this.registerType({
    isFilter: true,
    id: 'gradient-map',
    name: 'Gradient Map',
    inputs: [ 'input', 'gradient' ],
    outputs: [ 'output' ],
    parameters: GradientMapParameters,
    job: gradientMapJob
  });

  this.registerType({
    isFilter: true,
    id: 'height-to-normal',
    name: 'Height to Normal',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: HeightToNormalParameters,
    job: heightToNormalJob
  });

  this.registerType({
    isFilter: true,
    id: 'hsl-shift',
    name: 'HSL Shift',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: HslShiftParameters,
    job: hslShiftJob
  });

  this.registerType({
    isFilter: true,
    id: 'invert',
    name: 'Invert',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: InvertParameters,
    job: invertJob
  });

  this.registerType({
    isFilter: true,
    id: 'isolines',
    name: 'Isolines',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: IsolinesParameters,
    job: isolinesJob
  });

  this.registerType({
    isFilter: true,
    id: 'jitter-filter',
    name: 'Jitter Filter',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: JitterFilterParameters,
    job: jitterFilterJob
  });

  this.registerType({
    isFilter: true,
    id: 'make-tileable',
    name: 'Make Tileable',
    inputs: [ 'input', 'perturbation' ],
    outputs: [ 'output' ],
    parameters: MakeTileableParameters,
    job: makeTileableJob
  });

  this.registerType({
    isFilter: true,
    id: 'mirror',
    name: 'Mirror',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: MirrorParameters,
    job: mirrorJob
  });

  this.registerType({
    isFilter: true,
    id: 'normal-blend',
    name: 'Normal Blend',
    inputs: [ 'base', 'detail', 'mask' ],
    outputs: [ 'output' ],
    parameters: NormalBlendParameters,
    job: normalBlendJob
  });

  this.registerType({
    isFilter: true,
    id: 'normal-blur',
    name: 'Normal Blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NormalBlurParameters,
    job: normalBlurJob
  });

  this.registerType({
    isFilter: true,
    id: 'normal-invert',
    name: 'Normal Invert',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NormalInvertParameters,
    job: normalInvertJob
  });

  this.registerType({
    isFilter: true,
    id: 'normal-rotate',
    name: 'Normal Rotate',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NormalRotateParameters,
    job: normalRotateJob
  });

  this.registerType({
    isFilter: true,
    id: 'normal-tweak',
    name: 'Normal Tweak',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NormalTweakParameters,
    job: normalTweakJob
  });

  this.registerType({
    isFilter: true,
    id: 'normalize',
    name: 'Normalize',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: normalizeJob
  });

  this.registerType({
    isFilter: true,
    id: 'octave-sum',
    name: 'Octave Sum',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: OctaveSumParameters,
    job: octaveSumJob
  });

  this.registerType({
    isFilter: true,
    id: 'posterize',
    name: 'Posterize',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: PosterizeParameters,
    job: posterizeJob
  });

  this.registerType({
    isFilter: true,
    id: 'pow',
    name: 'Pow',
    inputs: [ 'input', 'exponent' ],
    outputs: [ 'output' ],
    parameters: PowParameters,
    job: powJob
  });

  this.registerType({
    isFilter: true,
    id: 'grayscale-conversion',
    name: 'Grayscale Conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: GrayscaleConversionParameters,
    job: grayscaleConversionJob
  });

  this.registerType({
    isFilter: true,
    id: 'shape-mapper',
    name: 'Shape Mapper',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ShapeMapperParameters,
    job: shapeMapperJob
  });

  this.registerType({
    isFilter: true,
    id: 'sharpen',
    name: 'Sharpen',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SharpenParameters,
    job: sharpenJob
  });

  this.registerType({
    isFilter: true,
    id: 'skew',
    name: 'Skew',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SkewParameters,
    job: skewJob
  });

  this.registerType({
    isFilter: true,
    id: 'solarize',
    name: 'Solarize',
    keywords: [ 'sabattier' ],
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SolarizeParameters,
    job: solarizeJob
  });

  this.registerType({
    isFilter: true,
    id: 'texture-patching',
    name: 'Texture Patching',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: TexturePatchingParameters,
    job: texturePatchingJob
  });

  this.registerType({
    isFilter: true,
    id: 'transform-2d',
    name: '2D Transform',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: Transform2dParameters,
    job: transform2dJob
  });

  this.registerType({
    isFilter: true,
    id: 'vibrance',
    name: 'Vibrance',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: VibranceParameters,
    job: vibranceJob
  });

  this.registerType({
    isFilter: true,
    id: 'warp',
    name: 'Warp',
    keywords: [ 'wrap' ],
    inputs: [ 'input', 'intensity' ],
    outputs: [ 'output' ],
    parameters: WarpParameters,
    job: warpJob
  });
};

module.exports = PopulatedTypeProvider;
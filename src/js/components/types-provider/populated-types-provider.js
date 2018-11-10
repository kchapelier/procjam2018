"use strict";

const TypeProvider = require('./types-provider');
const { extendClass } = require('./../../commons/utils');

var AnisotropicNoiseParameters = require('./../parameters/anisotropic-noise-parameters');
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
var DirectionalWrapParameters = require('./../parameters/directional-wrap-parameters');
var EdgeDetectParameters = require('./../parameters/edge-detect-parameters');
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
var LinearGradientParameters = require('./../parameters/linear-gradient-2-parameters');
var MakeTileableParameters = require('./../parameters/make-tileable-parameters');
var MirrorParameters = require('./../parameters/mirror-parameters');
var NoParameters = require('./../parameters/no-parameters');
var PosterizeParameters = require('./../parameters/posterize-parameters');
var PowParameters = require('./../parameters/pow-parameters');
var ShapeParameters = require('./../parameters/shape-parameters');
var ShapeMapperParameters = require('./../parameters/shape-mapper-parameters');
var SharpenParameters = require('./../parameters/sharpen-parameters');
var SkewParameters = require('./../parameters/skew-parameters');
var TexturePatchingParameters = require('./../parameters/texture-patching-parameters');
var Transform2dParameters = require('./../parameters/transform-2d-parameters');
var UniformColorParameters = require('./../parameters/uniform-color-parameters');
var UniformGrayscaleParameters = require('./../parameters/uniform-gray-parameters');
var ValueNoiseParameters = require('./../parameters/value-noise-parameters');
var ValueNoiseFractalParameters = require('./../parameters/value-noise-fractal-parameters');
var VibranceParameters = require('./../parameters/vibrance-parameters');
var WrapParameters = require('./../parameters/wrap-parameters');

var anisotropicNoiseJob = require('./../jobs/anisotropic-noise');
var blendJob = require('./../jobs/blend');
var bricksJob = require('./../jobs/bricks');
var brightnessContrastJob = require('./../jobs/brightness-contrast');
var cellularNoiseJob = require('./../jobs/cellular-noise');
var channelMergeJob = require('./../jobs/channel-merge');
var channelShuffleJob = require('./../jobs/channel-shuffle');
var channelSplitterJob = require('./../jobs/channel-splitter');
var clampJob = require('./../jobs/clamp');
var checkersJob = require('./../jobs/checkers');
var colorToMaskJob = require('./../jobs/color-to-mask');
var colorspaceConversionJob = require('./../jobs/colorspace-conversion');
var directionalBlurJob = require('./../jobs/directional-blur');
var directionalWrapJob = require('./../jobs/directional-wrap');
var edgeDetectJob = require('./../jobs/edge-detect');
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
var linearGradientJob = require('./../jobs/linear-gradient-2');
var makeTileableJob = require('./../jobs/make-tileable');
var mirrorJob = require('./../jobs/mirror');
var normalizeJob = require('./../jobs/normalize');
var posterizeJob = require('./../jobs/posterize');
var powJob = require('./../jobs/pow');
var shapeJob = require('./../jobs/shape');
var shapeMapperJob = require('./../jobs/shape-mapper');
var sharpenJob = require('./../jobs/sharpen');
var skewJob = require('./../jobs/skew');
var texturePatchingJob = require('./../jobs/texture-patching');
var transform2dJob = require('./../jobs/transform-2d');
var uniformColorJob = require('./../jobs/uniform-color');
var valueNoiseJob = require('./../jobs/value-noise');
var valueNoiseFractalJob = require('./../jobs/value-noise-fractal');
var vibranceJob = require('./../jobs/vibrance');
var wrapJob = require('./../jobs/wrap');

function PopulatedTypeProvider () {
  this.constructor.super.call(this);

  this.populate();
}

extendClass(PopulatedTypeProvider, TypeProvider);

PopulatedTypeProvider.prototype.populate = function () {
  this.setType('anisotropic-noise', {
    id: 'anisotropic-noise',
    name: 'Anisotropic noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: AnisotropicNoiseParameters,
    job: anisotropicNoiseJob
  });

  this.setType('bricks', {
    id: 'bricks',
    name: 'Bricks',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: BricksParameters,
    job: bricksJob
  });

  this.setType('channel-shuffle', {
    id: 'channel-shuffle',
    name: 'Channel shuffle',
    inputs: [ 'input1', 'input2', 'input3' ],
    outputs: [ 'output' ],
    parameters: ChannelShuffleParameters,
    job: channelShuffleJob
  });

  this.setType('channel-splitter', {
    id: 'channel-splitter',
    name: 'Channel splitter',
    inputs: [ 'input' ],
    outputs: [ 'channel1', 'channel2', 'channel3' ],
    parameters: NoParameters,
    job: channelSplitterJob
  });

  this.setType('channel-merge', {
    id: 'channel-merge',
    name: 'Channel Merge',
    inputs: [ 'channel1', 'channel2', 'channel3' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: channelMergeJob
  });

  this.setType('checkers', {
    id: 'checkers',
    name: 'Checkers',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: CheckersParameters,
    job: checkersJob
  });

  this.setType('fast-maze', {
    id: 'fast-maze',
    name: 'Fast Maze',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: FastMazeParameters,
    job: fastMazeJob
  });

  this.setType('gaussian-blur', {
    id: 'gaussian-blur',
    name: 'Gaussian blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: GaussianBlurParameters,
    job: gaussianBlurJob
  });

  this.setType('gradient-noise', {
    id: 'gradient-noise',
    name: 'Gradient noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseParameters,
    job: gradientNoiseJob
  });

  this.setType('gradient-noise-fractal', {
    id: 'gradient-noise-fractal',
    name: 'Gradient noise (fractal sum)',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseFractalParameters,
    job: gradientNoiseFractalJob
  });

  this.setType('image', {
    id: 'image',
    name: 'Image',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ImageParameters,
    job: imageJob
  });

  this.setType('linear-gradient', {
    id: 'linear-gradient',
    name: 'Linear Gradient',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: LinearGradientParameters,
    job: linearGradientJob
  });

  this.setType('shape', {
    id: 'shape',
    name: 'Shape',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ShapeParameters,
    job: shapeJob
  });

  this.setType('uniform-color', {
    id: 'uniform-color',
    name: 'Uniform color',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: UniformColorParameters,
    job: uniformColorJob
  });

  this.setType('uniform-grayscale', {
    id: 'uniform-grayscale',
    name: 'Uniform grayscale',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: UniformGrayscaleParameters,
    job: uniformColorJob
  });

  this.setType('value-noise', {
    id: 'value-noise',
    name: 'Value noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseParameters,
    job: valueNoiseJob
  });

  this.setType('value-noise-fractal', {
    id: 'value-noise-fractal',
    name: 'Value noise (fractal sum)',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseFractalParameters,
    job: valueNoiseFractalJob
  });





  this.setType('blend', {
    id: 'blend',
    name: 'Blend',
    inputs: [ 'background', 'foreground', 'mask' ],
    outputs: [ 'output' ],
    parameters: BlendParameters,
    job: blendJob
  });

  this.setType('brightness-contrast', {
    id: 'brightness-contrast',
    name: 'Brightness and contrast',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: BrightnessContrastParameters,
    job: brightnessContrastJob
  });

  this.setType('cellular-noise', {
    id: 'cellular-noise',
    name: 'Cellular noise',
    inputs: [],
    outputs: [ 'output' ],
    parameters: CellularNoiseParameters,
    job: cellularNoiseJob
  });

  this.setType('clamp', {
    id: 'clamp',
    name: 'Clamp',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ClampParameters,
    job: clampJob
  });

  this.setType('color-to-mask', {
    id: 'color-to-mask',
    name: 'Color to mask',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorToMaskParameters,
    job: colorToMaskJob
  });

  this.setType('colorspace-conversion', {
    id: 'colorspace-conversion',
    name: 'Colorspace conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorspaceConversionParameters,
    job: colorspaceConversionJob
  });

  this.setType('directional-blur', {
    id: 'directional-blur',
    name: 'Directional blur',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: DirectionalBlurParameters,
    job: directionalBlurJob
  });

  this.setType('directional-wrap', {
    id: 'directional-wrap',
    name: 'Directional wrap',
    inputs: [ 'input', 'intensity', 'angle' ],
    outputs: [ 'output' ],
    parameters: DirectionalWrapParameters,
    job: directionalWrapJob
  });

  this.setType('edge-detect', {
    id: 'edge-detect',
    name: 'Edge detect',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: EdgeDetectParameters,
    job: edgeDetectJob
  });

  this.setType('fix-mask', {
    id: 'fix-mask',
    name: 'Fix mask',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: FixMaskParameters,
    job: fixMaskJob
  });

  this.setType('gradient-map', {
    id: 'gradient-map',
    name: 'Gradient map',
    inputs: [ 'input', 'gradient' ],
    outputs: [ 'output' ],
    parameters: GradientMapParameters,
    job: gradientMapJob
  });

  this.setType('height-to-normal', {
    id: 'height-to-normal',
    name: 'Height to normal',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: HeightToNormalParameters,
    job: heightToNormalJob
  });

  this.setType('hsl-shift', {
    id: 'hsl-shift',
    name: 'HSL Shift',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: HslShiftParameters,
    job: hslShiftJob
  });

  this.setType('invert', {
    id: 'invert',
    name: 'Invert',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: InvertParameters,
    job: invertJob
  });

  this.setType('isolines', {
    id: 'isolines',
    name: 'Isolines',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: IsolinesParameters,
    job: isolinesJob
  });

  this.setType('make-tileable', {
    id: 'make-tileable',
    name: 'Make tileable',
    inputs: [ 'input', 'perturbation' ],
    outputs: [ 'output' ],
    parameters: MakeTileableParameters,
    job: makeTileableJob
  });

  this.setType('mirror', {
    id: 'mirror',
    name: 'Mirror',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: MirrorParameters,
    job: mirrorJob
  });

  this.setType('normalize', {
    id: 'normalize',
    name: 'Normalize',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: NoParameters,
    job: normalizeJob
  });

  this.setType('posterize', {
    id: 'posterize',
    name: 'Posterize',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: PosterizeParameters,
    job: posterizeJob
  });

  this.setType('pow', {
    id: 'pow',
    name: 'Pow',
    inputs: [ 'input', 'exponent' ],
    outputs: [ 'output' ],
    parameters: PowParameters,
    job: powJob
  });

  this.setType('grayscale-conversion', {
    id: 'grayscale-conversion',
    name: 'Grayscale conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: GrayscaleConversionParameters,
    job: grayscaleConversionJob
  });

  this.setType('shape-mapper', {
    id: 'shape-mapper',
    name: 'Shape mapper',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ShapeMapperParameters,
    job: shapeMapperJob
  });

  this.setType('sharpen', {
    id: 'sharpen',
    name: 'Sharpen',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SharpenParameters,
    job: sharpenJob
  });

  this.setType('skew', {
    id: 'skew',
    name: 'Skew',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SkewParameters,
    job: skewJob
  });

  this.setType('texture-patching', {
    id: 'texture-patching',
    name: 'Texture patching',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: TexturePatchingParameters,
    job: texturePatchingJob
  });

  this.setType('transform-2d', {
    id: 'transform-2d',
    name: '2D Transform',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: Transform2dParameters,
    job: transform2dJob
  });

  this.setType('vibrance', {
    id: 'vibrance',
    name: 'Vibrance',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: VibranceParameters,
    job: vibranceJob
  });

  this.setType('wrap', {
    id: 'wrap',
    name: 'Wrap',
    inputs: [ 'input', 'intensity' ],
    outputs: [ 'output' ],
    parameters: WrapParameters,
    job: wrapJob
  });
};

module.exports = PopulatedTypeProvider;
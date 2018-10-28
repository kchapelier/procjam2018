"use strict";

var Context = require('./components/webgl/context');

//var ColorspacesParameters = require('./components/parameters/colorspaces-parameters');
//var MirrorParameters = require('./components/parameters/mirror-parameters');
//var TexturePatchingParameters = require('./components/parameters/texture-patching-parameters');
var BricksParameters = require('./components/parameters/bricks-parameters');
var CheckersParameters = require('./components/parameters/checkers-parameters');
var FastMazeParameters = require('./components/parameters/fast-maze-parameters');
var GradientNoiseParameters = require('./components/parameters/gradient-noise-parameters');
var GradientNoiseFractalParameters = require('./components/parameters/gradient-noise-fractal-parameters');
var ImageParameters = require('./components/parameters/image-parameters');
var LinearGradientParameters = require('./components/parameters/linear-gradient-2-parameters');
var ShapeParameters = require('./components/parameters/shape-parameters');
var UniformColorParameters = require('./components/parameters/uniform-color-parameters');
var ValueNoiseParameters = require('./components/parameters/value-noise-parameters');
var ValueNoiseFractalParameters = require('./components/parameters/value-noise-fractal-parameters');
//var VibranceParameters = require('./components/parameters/vibrance-parameters');

var bricksJob = require('./components/jobs/bricks');
var checkersJob = require('./components/jobs/checkers');
var fastMazeJob = require('./components/jobs/fast-maze');
var gradientNoiseJob = require('./components/jobs/gradient-noise');
var gradientNoiseFractalJob = require('./components/jobs/gradient-noise-fractal');
var imageJob = require('./components/jobs/image');
var linearGradientJob = require('./components/jobs/linear-gradient-2');
var shapeJob = require('./components/jobs/shape');
var uniformColorJob = require('./components/jobs/uniform-color');
var valueNoiseJob = require('./components/jobs/value-noise');
var valueNoiseFractalJob = require('./components/jobs/value-noise-fractal');

var NodeGraph = require('./components/node-graph/node-graph');
var TypesProvider = require('./components/node-graph/types-provider');
var TypeSelector = require('./components/node-graph/type-selector');

var globalEE = require('./components/event-listener').global;

var { generateUUID } = require('./commons/utils');

console.log(globalEE);

globalEE.trigger('click', 1, 2);

var canvas = document.createElement('canvas');
var canvasCtx = canvas.getContext('2d');
canvas.width = canvas.height = 96;

canvas.style.position = 'absolute';
canvas.style.top = '0px';
canvas.style.left = '0px';

document.body.appendChild(canvas);

function App () {
  // Initialize node graph

  this.context = new Context();

  this.nodeGraph = document.querySelector('.graph');

  // Initialize sidebar

  this.sidebar = document.querySelector('.sidebar');

  // Initialize overlay/popup system

  this.overlay = document.querySelector('.overlay');
  this.overlayPopupContent = this.overlay.querySelector('.popup-content');
  this.overlayPopupCloseButton = this.overlay.querySelector('.popup-close-button');

  this.overlay.addEventListener('click', (e) => {
    if (e.target === this.overlay) {
      this.tentativelyClosePopup();
    }
  });

  this.overlayPopupCloseButton.addEventListener('click', (e) => {
    this.tentativelyClosePopup();
  });

  // Initialize error logger

  this.errorContainer = document.querySelector('main footer .error');
  this.errorText = this.errorContainer.querySelector('.error-text');
  this.errorTimeout = null;

  window.onerror = (e) => {
    this.setError(e, true);
    return false;
  };

  window.addEventListener('resize', () => {
    this.resize();
  });

  this.resize();

  this.typesProvider = new TypesProvider();

  this.typesProvider.setType('bricks', {
    id: 'bricks',
    name: 'Bricks',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: BricksParameters,
    job: bricksJob
  });

  this.typesProvider.setType('checkers', {
    id: 'checkers',
    name: 'Checkers',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: CheckersParameters,
    job: checkersJob
  });

  this.typesProvider.setType('fast-maze', {
    id: 'fast-maze',
    name: 'Fast Maze',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: FastMazeParameters,
    job: fastMazeJob
  });

  this.typesProvider.setType('gradient-noise', {
    id: 'gradient-noise',
    name: 'Gradient noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseParameters,
    job: gradientNoiseJob
  });

  this.typesProvider.setType('gradient-noise-fractal', {
    id: 'gradient-noise-fractal',
    name: 'Gradient noise (fractal sum)',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: GradientNoiseFractalParameters,
    job: gradientNoiseFractalJob
  });

  this.typesProvider.setType('image', {
    id: 'image',
    name: 'Image',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ImageParameters,
    job: imageJob
  });

  this.typesProvider.setType('linear-gradient', {
    id: 'linear-gradient',
    name: 'Linear Gradient',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: LinearGradientParameters,
    job: linearGradientJob
  });

  this.typesProvider.setType('shape', {
    id: 'shape',
    name: 'Shape',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ShapeParameters,
    job: shapeJob
  });

  this.typesProvider.setType('uniform-color', {
    id: 'uniform-color',
    name: 'Uniform color',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: UniformColorParameters,
    job: uniformColorJob
  });

  this.typesProvider.setType('value-noise', {
    id: 'value-noise',
    name: 'Value noise',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseParameters,
    job: valueNoiseJob
  });

  this.typesProvider.setType('value-noise-fractal', {
    id: 'value-noise-fractal',
    name: 'Value noise (fractal sum)',
    inputs: [ ],
    outputs: [ 'output' ],
    parameters: ValueNoiseFractalParameters,
    job: valueNoiseFractalJob
  });

  /*
  this.typesProvider.setType('colorspaces', {
    id: 'colorspaces',
    name: 'Colorspace conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorspacesParameters
  });

  this.typesProvider.setType('mirror', {
    id: 'mirror',
    name: 'Mirror',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: MirrorParameters
  });

  this.typesProvider.setType('vibrance', {
    id: 'vibrance',
    name: 'Vibrance',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: VibranceParameters
  });

  this.typesProvider.setType('texture-patching', {
    id: 'texture-patching',
    name: 'Texture patching',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: TexturePatchingParameters
  });
  */

  this.graph = new NodeGraph(this);

  var selector = new TypeSelector(this.typesProvider, function (type) {
    globalEE.trigger('create-node', type);
  });

  document.addEventListener('mousemove', e => {
    selector.setNextPosition(e.clientX, e.clientY);
  });

  document.body.addEventListener('keypress', e => {
    if (e.keyCode === 32) {
      selector.toggle();
    }
  });

  this.parameters = {};
  this.jobs = {};
  this.outputs = {};
  this.parametersShown = null;

  globalEE.on('create-node', (typeId) => {
    var uuid = generateUUID();
    var type = this.typesProvider.getType(typeId);

    console.log('create-node', typeId, type, uuid);

    this.jobs[uuid] = type.job;
    this.parameters[uuid] = new (type.parameters)(type.name, {}, (v) => { globalEE.trigger('change-parameters', uuid, v) });
    this.graph.selectNode(this.graph.addNode(uuid, type));

    this.outputs[uuid] = {};
    for(var i = 0; i < type.outputs.length; i++) {
      this.outputs[uuid][type.outputs[i]] = this.context.createTexture(1024, 1024);
    }
  });

  globalEE.on('delete-node', (uuid) => {
    console.log('delete-node', uuid);

    if (this.parametersShown === uuid) {
      this.displayParameters(null);
    }

    delete this.jobs[uuid];
    this.parameters[uuid].freeElements();
    delete this.parameters[uuid];
    this.graph.removeNode(uuid);

    for (var key in this.outputs[uuid]) {
      this.outputs[uuid][key].dispose();
    }

    delete this.outputs[uuid];
  });

  globalEE.on('display-parameters', (uuid) => {
    console.log('display-parameters', uuid);

    this.displayParameters(uuid);
  });

  globalEE.on('change-parameters', (uuid, values) => {
    console.log('change-parameters', uuid, values);
    //console.log(this.parameters[uuid].values);

    console.time('process-' + uuid);
    this.jobs[uuid](this.context, {}, this.outputs[uuid], values, () => {
      console.timeEnd('process-' + uuid);
      var uiNode = this.graph.getNode(uuid);
      this.context.drawToCanvas(uiNode.canvas, uiNode.canvasCtx, this.outputs[uuid].output);
    });
  });
}

/*
App.prototype.testWebgl = function () {
  var context = new Context();

  var program = context.createProgram(`#version 300 es
    precision highp float;
    precision highp int;
    precision highp sampler2D;

    layout(location = 0) out vec4 fragColor;

    uniform vec2 resolution;
    uniform float seed;

    void main () {
        vec2 uv = gl_FragCoord.xy / resolution;
        fragColor = vec4(uv.x, uv.y, seed, 1.);
    }
  `, {});

  var texture = context.createTexture(1024, 1024);

  program.execute({}, texture);

  console.log(texture.getFloatArray());


};
*/

App.prototype.displayParameters = function (parametersUuid) {
  this.sidebar.innerHTML = '';
  var parameters = this.parameters[parametersUuid] || null;

  if (parameters) {
    this.sidebar.appendChild(parameters.getElements());
  }

  this.parametersShown = parameters ? parametersUuid : null;
};

App.prototype.resize = function () {
  //console.log(this);
  //console.log(this.nodeGraph.getBoundingClientRect());
};

App.prototype.displayPopup = function (el, allowPrematureClose) {
  this.allowPrematurePopupClose = allowPrematureClose;
  this.overlayPopupContent.innerHTML = '';
  this.overlayPopupContent.appendChild(el);
  this.overlay.classList.add('visible');

  if (allowPrematureClose) {
    this.overlay.classList.add('with-close-button');
  } else {
    this.overlay.classList.remove('with-close-button');
  }
};

App.prototype.tentativelyClosePopup = function () {
  if (this.allowPrematurePopupClose) {
    this.closePopup();
  }
};

App.prototype.closePopup = function () {
  this.overlay.classList.remove('visible');
};

App.prototype.closePopup = function () {
  this.overlay.classList.remove('visible');
};

App.prototype.clearError = function () {
  this.errorContainer.classList.remove('visible');
  this.errorTimeout = null;
};

App.prototype.setError = function (error, silent) {
  if (this.errorTimeout !== null) {
    clearTimeout(this.errorTimeout);
  }

  if (!silent && console.error) {
    console.error(error);
  }

  this.errorText.innerText = typeof error !== 'string' ? error.message : error;
  this.errorContainer.classList.add('visible');

  this.errorTimeout = setTimeout(() => {
    this.clearError();
  }, 5000);
};

App.prototype.loadStateFromGist = function (url) {
  // this assume the gist contains only one file, the json file we want to load
  // TODO handle fetch errors

  var match = /^https?:\/\/gist\.(github|githubusercontent)\.com\/([^\/ \?#]+)\/([a-z0-9]+)/.exec(url);

  if (match !== null) {
    fetch('https://gist.githubusercontent.com/' + match[2] + '/' + match[3] + '/raw').then(function(response) {
      return response.json();
    })
      .then(json => {
        this.loadState(json);
      });
  } else {
    this.setError(new Error('Invalid gist url'));
  }
};

App.prototype.loadStateFromFile = function (file) {
  // TODO handle FileReader and JSON.parse errors

  var reader = new FileReader();
  reader.onload = (e) => {
    this.loadState(JSON.parse(e.target.result));
  };
  reader.readAsText(file);
};

App.prototype.loadState = function (data) {
  // TODO verify state integrity
  // TODO implement state loading

  console.log(data);
};

module.exports = App;
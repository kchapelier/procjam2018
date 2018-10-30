"use strict";

var Context = require('./components/webgl/context');


//var TexturePatchingParameters = require('./components/parameters/texture-patching-parameters');
var BlendParameters = require('./components/parameters/blend-parameters');
var BricksParameters = require('./components/parameters/bricks-parameters');
var CheckersParameters = require('./components/parameters/checkers-parameters');
var ColorspaceConversionParameters = require('./components/parameters/colorspace-conversion-parameters');
var FastMazeParameters = require('./components/parameters/fast-maze-parameters');
var GradientNoiseParameters = require('./components/parameters/gradient-noise-parameters');
var GradientNoiseFractalParameters = require('./components/parameters/gradient-noise-fractal-parameters');
var GrayscaleConversionParameters = require('./components/parameters/grayscale-conversion-parameters');
var ImageParameters = require('./components/parameters/image-parameters');
var InvertParameters = require('./components/parameters/invert-parameters');
var LinearGradientParameters = require('./components/parameters/linear-gradient-2-parameters');
var MirrorParameters = require('./components/parameters/mirror-parameters');
var ShapeParameters = require('./components/parameters/shape-parameters');
var ShapeMapperParameters = require('./components/parameters/shape-mapper-parameters');
var SharpenParameters = require('./components/parameters/sharpen-parameters');
var UniformColorParameters = require('./components/parameters/uniform-color-parameters');
var ValueNoiseParameters = require('./components/parameters/value-noise-parameters');
var ValueNoiseFractalParameters = require('./components/parameters/value-noise-fractal-parameters');
var VibranceParameters = require('./components/parameters/vibrance-parameters');

var blendJob = require('./components/jobs/blend');
var bricksJob = require('./components/jobs/bricks');
var checkersJob = require('./components/jobs/checkers');
var colorspaceConversionJob = require('./components/jobs/colorspace-conversion');
var fastMazeJob = require('./components/jobs/fast-maze');
var gradientNoiseJob = require('./components/jobs/gradient-noise');
var gradientNoiseFractalJob = require('./components/jobs/gradient-noise-fractal');
var grayscaleConversionJob = require('./components/jobs/grayscale-conversion');
var imageJob = require('./components/jobs/image');
var invertJob = require('./components/jobs/invert');
var linearGradientJob = require('./components/jobs/linear-gradient-2');
var mirrorJob = require('./components/jobs/mirror');
var shapeJob = require('./components/jobs/shape');
var shapeMapperJob = require('./components/jobs/shape-mapper');
var sharpenJob = require('./components/jobs/sharpen');
var uniformColorJob = require('./components/jobs/uniform-color');
var valueNoiseJob = require('./components/jobs/value-noise');
var valueNoiseFractalJob = require('./components/jobs/value-noise-fractal');
var vibranceJob = require('./components/jobs/vibrance');

var WorkingGraph = require('./components/working-graph/working-graph');
var NodeGraph = require('./components/node-graph/node-graph');
var TypesProvider = require('./components/node-graph/types-provider');
var TypeSelector = require('./components/node-graph/type-selector');

var globalEE = require('./components/event-emitter').global;

var parseUrlHash = require('./commons/parse-url-hash');
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

  this.version = 1;
  this.context = new Context();

  this.nodeGraph = document.querySelector('.graph');

  // buttons

  this.saveButton = document.querySelector('.save-button');
  this.saveButton.addEventListener('click', () => {
    this.saveButton.blur();
    var d = new Date();
    var filename = 'textool-' + (
      d.getFullYear() + ('0' + (d.getMonth()+1)).substr(-2) + ('0' + d.getDate()).substr(-2) + '-' +
      ('0' + d.getHours()).substr(-2) + ('0' + d.getMinutes()).substr(-2) + ('0' + d.getSeconds()).substr(-2)
    ) + '.json';
    this.downloadState(filename);
  });

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





  this.typesProvider.setType('blend', {
    id: 'blend',
    name: 'Blend',
    inputs: [ 'background', 'foreground', 'mask' ],
    outputs: [ 'output' ],
    parameters: BlendParameters,
    job: blendJob
  });

  this.typesProvider.setType('colorspace-conversion', {
    id: 'colorspace-conversion',
    name: 'Colorspace conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ColorspaceConversionParameters,
    job: colorspaceConversionJob
  });

  this.typesProvider.setType('invert', {
    id: 'invert',
    name: 'Invert',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: InvertParameters,
    job: invertJob
  });

  this.typesProvider.setType('mirror', {
    id: 'mirror',
    name: 'Mirror',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: MirrorParameters,
    job: mirrorJob
  });

  this.typesProvider.setType('grayscale-conversion', {
    id: 'grayscale-conversion',
    name: 'Grayscale conversion',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: GrayscaleConversionParameters,
    job: grayscaleConversionJob
  });

  this.typesProvider.setType('shape-mapper', {
    id: 'shape-mapper',
    name: 'Shape mapper',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: ShapeMapperParameters,
    job: shapeMapperJob
  });

  this.typesProvider.setType('sharpen', {
    id: 'sharpen',
    name: 'Sharpen',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: SharpenParameters,
    job: sharpenJob
  });

  this.typesProvider.setType('vibrance', {
    id: 'vibrance',
    name: 'Vibrance',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: VibranceParameters,
    job: vibranceJob
  });

  /*
  this.typesProvider.setType('texture-patching', {
    id: 'texture-patching',
    name: 'Texture patching',
    inputs: [ 'input' ],
    outputs: [ 'output' ],
    parameters: TexturePatchingParameters
  });
  */

  this.workingGraph = new WorkingGraph(this.context);
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
  this.parametersShown = null;

  globalEE.on('create-connection', (connectionUuid, fromUuid, fromParam, toUuid, toParam) => {
    this.workingGraph.createConnection(connectionUuid, fromUuid, fromParam, toUuid, toParam);
  });

  globalEE.on('delete-connection', (connectionUuid) => {
    this.workingGraph.deleteConnection(connectionUuid);
  });

  globalEE.on('create-node', (typeId) => {
    var uuid = generateUUID();

    this.createNode(uuid, typeId, {}, null, null);
    this.graph.selectNode(this.graph.getNode(uuid));
  });

  globalEE.on('delete-node', (uuid) => {
    console.log('delete-node', uuid);

    if (this.parametersShown === uuid) {
      this.displayParameters(null);
    }

    this.parameters[uuid].freeElements();
    delete this.parameters[uuid];
    this.graph.removeNode(uuid);
    this.workingGraph.deleteNode(uuid);
  });

  globalEE.on('display-parameters', (uuid) => {
    console.log('display-parameters', uuid);

    this.displayParameters(uuid);
  });

  globalEE.on('change-parameters', (uuid, values) => {
    console.log('change-parameters', uuid, values);
    //console.log(this.parameters[uuid].values);

    var uiNode = this.graph.getNode(uuid);
    this.workingGraph.executeNodeJob(uuid, values, uiNode.canvas, uiNode.canvasCtx);
  });

  globalEE.on('create-texture-from-image', (img, callback) => {
    var texture = this.context.createTexture(img.naturalWidth, img.naturalHeight, false);
    texture.updateFromImageElement(img);
    callback(texture);
  });

  var hashOptions = parseUrlHash();

  if (hashOptions.gist) {
    this.loadStateFromGist(hashOptions.gist);
  }
}

App.prototype.getState = function () {
  var nodes = {};
  var connections = {};

  for (var nodeUuid in this.parameters) {
    var nodeInGraph = this.graph.getNode(nodeUuid);
    var nodeInWorkingGraph = this.workingGraph.getNode(nodeUuid);

    if (nodeInGraph && nodeInWorkingGraph) {
      var nodeParams = this.parameters[nodeUuid].values;
      var processedParams = {};

      for (var paramName in nodeParams) {
        var paramValue = nodeParams[paramName];
        var paramType = typeof paramValue;

        if (paramType === 'number' || paramType === 'string' || paramType === 'boolean' || Array.isArray(paramValue)) {
          processedParams[paramName] = paramValue;
        }
      }

      nodes[nodeUuid] = {
        type: nodeInWorkingGraph.type,
        position: [nodeInGraph.positionX, nodeInGraph.positionY],
        params: processedParams
      };
    }
  }

  for (var connectionUuid in this.workingGraph.connections) {
    var connectionInWorkingGraph = this.workingGraph.connections[connectionUuid];

    if (
      nodes.hasOwnProperty(connectionInWorkingGraph.fromUuid) &&
      nodes.hasOwnProperty(connectionInWorkingGraph.toUuid)
    ) {
      connections[connectionUuid] = {
        fromUuid: connectionInWorkingGraph.fromUuid,
        fromParam: connectionInWorkingGraph.fromParam,
        toUuid: connectionInWorkingGraph.toUuid,
        toParam: connectionInWorkingGraph.toParam
      };
    }
  }

  return {
    version: this.version,
    board: {
      position: [this.graph.boardPositionX, this.graph.boardPositionY]
    },
    nodes: nodes,
    connections: connections
  };
};

App.prototype.downloadState = function (filename) {
  var blob = new Blob([ JSON.stringify(this.getState(), null, 2)], {
    type: 'text/plain;charset=utf-8'
  });

  var url = URL.createObjectURL(blob);

  var a = document.createElement('a');
  a.setAttribute('download', filename);
  a.setAttribute('href', url);
  a.click();
};

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
    fetch('https://gist.githubusercontent.com/' + match[2] + '/' + match[3] + '/raw', { cache: 'no-cache' }).then(function(response) {
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

App.prototype.createNode = function (uuid, typeId, params, x, y) {
  var type = this.typesProvider.getType(typeId);

  this.workingGraph.createNode(uuid, type);

  this.parameters[uuid] = new (type.parameters)(type.name, params, (v) => { globalEE.trigger('change-parameters', uuid, v) });
  var node = this.graph.addNode(uuid, type);

  if (x !== null && y !== null) {
    node.position(x, y);
  }
};

App.prototype.loadState = function (data) {
  // very basic state integrity check

  if (
    !data.hasOwnProperty('version') || typeof data.version !== 'number' ||
    !data.hasOwnProperty('board') || typeof data.board !== 'object' ||
    !data.hasOwnProperty('nodes') || typeof data.nodes !== 'object'
  ) {
    this.setError('Incorrect state format', true);
    return false;
  } else if (data.version > App.version) {
    this.setError('Incorrect version : ' + data.version, true);
    return false;
  }

  this.graph.moveBoard(data.board.position[0], data.board.position[1], true);

  for (let uuid in data.nodes) {
    var nodeDesc = data.nodes[uuid];
    this.createNode(uuid, nodeDesc.type, nodeDesc.params, nodeDesc.position[0], nodeDesc.position[1]);
  }

  for (let uuid in data.connections) {
    var connectionDesc = data.connections[uuid];

    this.graph.addConnection(uuid);
    this.graph.setConnectionFromTo(uuid, connectionDesc.fromUuid, connectionDesc.fromParam, connectionDesc.toUuid, connectionDesc.toParam);

    this.workingGraph.createConnection(uuid, connectionDesc.fromUuid, connectionDesc.fromParam, connectionDesc.toUuid, connectionDesc.toParam);
  }

  return true;
};

module.exports = App;
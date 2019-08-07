"use strict";

var Context = require('./components/webgl/context');

var WorkingGraph = require('./components/working-graph/working-graph');
var NodeGraph = require('./components/node-graph/node-graph');
var Preview = require('./components/preview/preview');
var TypesProvider = require('./components/types-provider/populated-types-provider');
var TypeSelector = require('./components/node-graph/type-selector');

var globalEE = require('./components/event-emitter').global;

var parseUrlQuery = require('./commons/parse-url-query');
var download = require('./commons/download');
var normalizeSave = require('./normalize-save');
var { generateUUID } = require('./commons/utils');

function App () {
  // Initialize node graph

  this.version = 6;
  this.versionStr = '1.2.2';
  this.context = new Context();

  var hashOptions = parseUrlQuery();

  document.querySelector('#version').innerHTML = this.versionStr;

  // buttons
  this.loadPopup = document.querySelector('.load-popup');
  this.loadPopup.parentNode.removeChild(this.loadPopup);
  this.loadPanel = this.loadPopup.querySelector('.load-panel');
  this.loadPopupInput = this.loadPopup.querySelector('.load-popup-input');
  this.loadButton = document.querySelector('.load-button');
  this.loadButton.addEventListener('click', () => {
    this.loadButton.blur();
    this.loadPopupInput.value = null;
    this.displayPopup(this.loadPopup, true);
  });
  this.loadPanel.addEventListener('click', () => {
    this.loadPopupInput.click();
  });
  this.loadPopupInput.addEventListener('input', e => {
    if (e.target.files && e.target.files.length > 0) {
      this.loadStateFromFile(e.target.files[0]);
      this.closePopup();
    }
  });
  this.loadPanel.addEventListener('dragenter', e => {
    e.preventDefault();
    this.loadPanel.classList.add('dragging-file');
  });

  this.loadPanel.addEventListener('dragleave', e => {
    this.loadPanel.classList.remove('dragging-file');
  });

  this.loadPanel.addEventListener('dragover', e => {
    e.preventDefault();
  });

  this.loadPanel.addEventListener('drop', e => {
    e.preventDefault();
    this.loadPanel.classList.remove('dragging-file');

    if (e.dataTransfer.files.length > 0) {
      this.loadStateFromFile(e.dataTransfer.files[0]);
      this.closePopup();
    }
  });

  this.saveButton = document.querySelector('.save-button');
  this.saveButton.addEventListener('click', () => {
    this.saveButton.blur();
    var d = new Date();
    var filename = 'graph-ical-' + (
      d.getFullYear() + ('0' + (d.getMonth()+1)).substr(-2) + ('0' + d.getDate()).substr(-2) + '-' +
      ('0' + d.getHours()).substr(-2) + ('0' + d.getMinutes()).substr(-2) + ('0' + d.getSeconds()).substr(-2)
    ) + '.tx.json';
    this.downloadState(filename);
  });

  // Initialize sidebar

  this.sidebar = document.querySelector('.sidebar');
  this.sidebarContent = this.sidebar.querySelector('.sidebar-content');

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


  this.typesProvider = new TypesProvider();

  this.workingGraph = new WorkingGraph(this.context, hashOptions.size);
  this.graph = new NodeGraph(this);

  this.preview = new Preview(hashOptions.size);

  var selector = new TypeSelector(this.typesProvider, function (type) {
    globalEE.trigger('create-node', type, {}, null, null);
  });

  selector.setNextPosition(window.innerWidth / 2, window.innerHeight / 2);

  document.addEventListener('mousemove', e => {
    selector.setNextPosition(e.clientX, e.clientY);
  });

  document.body.addEventListener('keypress', e => {
    var code = e.keyCode || e.charCode;
    if (code === 32 && !this.preview.active) {
      selector.toggle();
    }
  });


  window.addEventListener('resize', () => {
    this.resize();
  });

  this.resize();

  this.parameters = {};
  this.parametersShown = null;

  globalEE.on('create-connection', (connectionUuid, fromUuid, fromParam, toUuid, toParam) => {
    this.workingGraph.createConnection(connectionUuid, fromUuid, fromParam, toUuid, toParam);
  });

  globalEE.on('delete-connection', (connectionUuid) => {
    //console.log('delete-connection', connectionUuid);
    this.workingGraph.deleteConnection(connectionUuid);
  });

  globalEE.on('create-node', (typeId, parameters, posX, posY) => {
    var uuid = generateUUID();

    this.createNode(uuid, typeId, parameters||{}, posX, posY);
    var uiNode = this.graph.getNode(uuid);
    this.graph.selectNode(uiNode);
    this.displayParameters(uuid);
  });

  globalEE.on('delete-node', (uuid) => {
    //console.log('delete-node', uuid);

    if (this.parametersShown === uuid) {
      this.displayParameters(null);
    }

    this.parameters[uuid].freeElements();
    delete this.parameters[uuid];
    this.graph.removeNode(uuid);
    this.workingGraph.deleteNode(uuid);
  });

  globalEE.on('display-parameters', (uuid) => {
    //console.log('display-parameters', uuid);

    this.displayParameters(uuid);
  });

  globalEE.on('show-full-preview', (uuid) => {
    this.displayPreview(uuid);
  });

  globalEE.on('change-parameters', (uuid, values) => {
    //console.log('change-parameters', uuid, values);
    //console.log(this.parameters[uuid].values);

    var uiNode = this.graph.getNode(uuid);
    this.workingGraph.scheduleNodeJob(uuid);
  });

  globalEE.on('create-buffers', (number, repeat, callback) => {
    var buffers = [];

    for (var i = 0; i < number; i++) {
      buffers.push(this.context.createTexture(hashOptions.size, hashOptions.size, repeat));
    }

    callback(buffers);
  });

  globalEE.on('create-texture-from-image', (img, callback) => {
    var texture = this.context.createTexture(img.naturalWidth, img.naturalHeight, false);
    texture.updateFromImageElement(img);
    callback(texture);
  });

  globalEE.on('update-texture', (uuid, texture) => {
    if (this.preview.active && this.preview.shownNode === uuid) {
      this.preview.changeTexture(texture);
    }
  });

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
      var nodeParams = nodeInWorkingGraph.parameters;
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
    parametersShown: this.parametersShown,
    previewShown: this.preview.active ? this.preview.shownNode : null,
    nodes: nodes,
    connections: connections
  };
};

App.prototype.downloadState = function (filename) {
  download(
    [ JSON.stringify(this.getState(), null, 2) ],
    'text/plain;charset=utf-8',
    filename
  );
};

App.prototype.displayPreview = function (uuid) {
  this.preview.changeTexture(this.workingGraph.nodes[uuid].defaultTexture);
  this.preview.show(uuid);
};

App.prototype.displayParameters = function (parametersUuid) {
  this.sidebarContent.innerHTML = '';
  var parameters = this.parameters[parametersUuid] || null;

  if (parameters) {
    this.sidebarContent.appendChild(parameters.getElements());
  }

  this.parametersShown = parameters ? parametersUuid : null;
};

App.prototype.resize = function () {
  this.graph.resize();
  this.preview.resize();
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
    this.errorTimeout = null;
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
    fetch('https://gist.githubusercontent.com/' + match[2] + '/' + match[3] + '/raw', { cache: 'no-cache' })
      .then(function(response) {
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

  this.parameters[uuid] = new (type.parameters)(type.name, params, (v) => { globalEE.trigger('change-parameters', uuid, v) });
  this.workingGraph.createNode(uuid, type, this.parameters[uuid].values);
  var node = this.graph.addNode(uuid, type);
  this.workingGraph.setNodeCanvas(uuid, node.canvas, node.canvasCtx);


  if (x !== null && y !== null) {
    node.position(x, y);
  }
};

App.prototype.clearState = function () {
  this.displayParameters(null);

  for (var nodeUuid in this.parameters) {
    this.parameters[nodeUuid].freeElements();
    delete this.parameters[nodeUuid];
    this.graph.removeNode(nodeUuid);
    this.workingGraph.deleteNode(nodeUuid);
  }

  this.workingGraph.scheduleAll();
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

  // normalize the data

  data = normalizeSave(data);

  this.clearState();

  this.graph.moveBoard(data.board.position[0], data.board.position[1], true);

  for (let uuid in data.nodes) {
    var nodeDesc = data.nodes[uuid];
    this.createNode(uuid, nodeDesc.type, nodeDesc.params, nodeDesc.position[0], nodeDesc.position[1]);
  }

  for (let uuid in data.connections) {
    var connectionDesc = data.connections[uuid];

    this.graph.addConnection(uuid);
    this.graph.setConnectionFromTo(uuid, connectionDesc.fromUuid, connectionDesc.fromParam, connectionDesc.toUuid, connectionDesc.toParam);

    this.workingGraph.createConnection(uuid, connectionDesc.fromUuid, connectionDesc.fromParam, connectionDesc.toUuid, connectionDesc.toParam, true);
  }

  if (data.parametersShown) {
    //this.graph.selectNode(data.parametersShown);
    this.displayParameters(data.parametersShown);
  }

  if (data.previewShown) {
    this.displayPreview(data.previewShown);
  }

  this.workingGraph.scheduleAll();

  return true;
};

module.exports = App;
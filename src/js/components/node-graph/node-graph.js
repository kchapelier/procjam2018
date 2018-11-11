"use strict";

var { generateUUID, uniqueArray } = require('./../../commons/utils');
var Node = require('./node');
var Connection = require('./connection');

var globalEE = require('./../event-emitter').global;

function NodeGraph (app) {
  this.app = app;
  this.root = document.querySelector('.graph');
  this.container = this.root.querySelector('.graph-container');
  this.nodesLayer = this.root.querySelector('.node-layer');
  this.connectionsLayer = document.querySelector('.connection-layer');

  var bb = this.root.getBoundingClientRect();
  this.isBoardDragging = false;
  this.boardPositionX = 0;
  this.boardPositionY = 0;
  this.boardWidth = bb.width;
  this.boardHeight = bb.height;

  this.isNodeDragging = false;
  this.nodeOffsetX = 0;
  this.nodeOffsetY = 0;

  this.isConnectionDragging = false;
  this.draggedConnection = null;
  this.draggedConnectionFromUuid = null;
  this.draggedConnectionFromParam = null;
  this.draggedConnectionToUuid = null;
  this.draggedConnectionToParam = null;

  this.selectedConnection = null;
  this.selectedNode = null;

  this.autoSnapping = false;

  this.nodes = {};
  this.outputs = {};
  this.connections = {};

  this.addEvents();
}

NodeGraph.prototype.addEvents = function () {
  this.root.addEventListener('mouseenter', e => {
    if (e.target.classList.contains('interactive-path')) {
      e.target.parentNode.classList.add('hover');
    }
  }, true);

  this.root.addEventListener('mouseleave', e => {
    if (e.target.classList.contains('interactive-path')) {
      e.target.parentNode.classList.remove('hover');
    }
  }, true);

  var nodeClickTime = 0;
  var nodeClickUuid = '';

  this.root.addEventListener('mousedown', e => {
    if (e.target.classList.contains('node')) {
      var nowTime = Date.now();
      var nowUuid = e.target.getAttribute('data-uuid');
      var node = this.getNode(nowUuid);

      if (e.ctrlKey || e.metaKey) {
        // ctrl click open the preview without changing the selected node
        // allow to modify the params of a node further down the graph and see how it affects one of its dependents
        this.showFullPreview(node);
      } else if (nowTime - nodeClickTime < 300 && nowUuid === nodeClickUuid) {
        //double click handling
        this.selectNode(node);
        this.selectConnection(null);
        this.showFullPreview(node);
      } else {
        // simple click handling
        this.isNodeDragging = true;
        this.root.classList.add('node-dragging');

        var bb = node.element.getBoundingClientRect();
        this.nodeOffsetX = Math.round(e.clientX - bb.x - bb.width / 2);
        this.nodeOffsetY = Math.round(e.clientY - bb.y + 4); // where does this 4px offset come from ?

        this.selectNode(node);
        this.selectConnection(null);
        this.displayParameters(node);
      }

      nodeClickTime = nowTime;
      nodeClickUuid = nowUuid;
    } else if (e.target.classList.contains('interactive-path')) {
      var connection = this.connections[e.target.parentNode.getAttribute('data-uuid')];

      if (this.selectedConnection === connection) {
        this.selectConnection(null);
      } else {
        this.selectConnection(connection);
      }

      this.selectNode(null);
    } else if (e.target.classList.contains('anchor-output')) {
      this.isConnectionDragging = true;
      this.draggedConnection = this.addConnection(null);
      this.draggedConnectionFromUuid = e.target.getAttribute('data-uuid');
      this.draggedConnectionFromParam = e.target.getAttribute('data-name');
      this.draggedConnection.svg.classList.add('dragging');
      this.root.classList.add('connection-dragging');
    } else {
      this.isBoardDragging = true;
      this.root.classList.add('board-dragging');
    }
  });

  window.addEventListener('mousemove', e => {
    if (this.isConnectionDragging) {
      var canConnectTo = false;
      var isAnchor = e.target.classList && e.target.classList.contains('anchor-input');

      if (isAnchor) {
        canConnectTo = this.canConnectNodes(this.draggedConnectionFromUuid, e.target.getAttribute('data-uuid'));
      }

      if (canConnectTo) {
        this.draggedConnectionToUuid = e.target.getAttribute('data-uuid');
        this.draggedConnectionToParam = e.target.getAttribute('data-name');
        this.setConnectionFromTo(this.draggedConnection.uuid, this.draggedConnectionFromUuid, this.draggedConnectionFromParam, this.draggedConnectionToUuid, this.draggedConnectionToParam);
      } else {
        this.draggedConnectionToUuid = null;
        this.draggedConnectionToParam = null;
        this.setConnectionFrom(this.draggedConnection.uuid, this.draggedConnectionFromUuid, this.draggedConnectionFromParam, e.clientX, e.clientY - 54);
      }

      if (isAnchor && !canConnectTo) {
        this.draggedConnection.svg.classList.add('error');
      } else {
        this.draggedConnection.svg.classList.remove('error');
      }
    } else if (this.isNodeDragging) {
      var posX = (e.clientX - this.nodeOffsetX - this.boardPositionX);
      var posY = (e.clientY - this.nodeOffsetY - this.boardPositionY);

      if (e.altKey || e.shiftKey || this.autoSnapping) {
        posX = Math.round(posX / 25) * 25;
        posY = Math.round(posY / 25) * 25;
      }

      this.selectedNode.position(posX, posY);

      for (var key in this.connections) {
        var connection = this.connections[key];
        if (connection.isLinkedTo(this.selectedNode.uuid)) {
          this.setConnectionFromTo(connection.uuid, connection.fromUuid, connection.fromParam, connection.toUuid, connection.toParam);
        }
      }

      //this.setConnectionFromTo(connection.uuid, node2.uuid, 'output', node1.uuid, 'input1');
    } else if (this.isBoardDragging) {
      this.moveBoard(this.boardPositionX + e.movementX, this.boardPositionY + e.movementY);
    }
  });

  window.addEventListener('mouseup', e => {
    if (this.isConnectionDragging) {
      if (this.draggedConnectionToUuid) {
        this.draggedConnection.svg.classList.remove('dragging');
        this.removeConnectionToOutputParam(this.draggedConnectionToUuid, this.draggedConnectionToParam, this.draggedConnection.uuid);
        this.triggerCreateConnection(this.draggedConnection);
      } else {
        this.removeConnection(this.draggedConnection);
      }

      this.isConnectionDragging = false;
      this.draggedConnection = null;
      this.draggedConnectionFromUuid = null;
      this.draggedConnectionFromParam = null;
      this.draggedConnectionToUuid = null;
      this.draggedConnectionToParam = null;
      this.root.classList.remove('connection-dragging');
    } else if (this.isNodeDragging) {
      this.isNodeDragging = false;
      this.root.classList.remove('node-dragging');
    } else if (this.isBoardDragging) {
      this.isBoardDragging = false;
      this.root.classList.remove('board-dragging');
    }
  });

  this.root.addEventListener('keydown', e => {
    var code = e.keyCode || e.charCode;
    // backspace or delete
    if (code === 8 || code === 46) {
      e.preventDefault();

      if (this.selectedConnection !== null) {
        this.triggerDeleteConnection(this.selectedConnection);
        this.removeConnection(this.selectedConnection);
      }

      if (this.selectedNode !== null) {
        globalEE.trigger('delete-node', this.selectedNode.uuid);
      }
    } else if (code === 27) {
      this.selectNode(null);
      this.selectConnection(null);

      // TODO disable node dragging mode
      // TODO disable board dragging mode
    }
  });
};

NodeGraph.prototype.moveBoard = function (x, y, noTransition) {
  if (noTransition) {
    this.container.classList.add('no-transition');
  }

  this.boardPositionX = x;
  this.boardPositionY = y;
  this.container.style.transform = 'translate(' + this.boardPositionX + 'px, ' + this.boardPositionY + 'px)';

  if (noTransition) {
    setTimeout(() => {
      this.container.classList.remove('no-transition');
    }, 5);

  }
};

NodeGraph.prototype.resize = function () {
  var bb = this.root.getBoundingClientRect();
  this.boardWidth = bb.width;
  this.boardHeight = bb.height;
};

NodeGraph.prototype.addNode = function (uuid, type) {
  var node = new Node (uuid, type);
  this.nodes[node.uuid] = node;

  this.nodesLayer.appendChild(node.element);

  if (this.selectedConnection && node.inputs.length) {
    var fromUuid = this.selectedConnection.fromUuid;
    var fromParam = this.selectedConnection.fromParam;
    var toUuid = this.selectedConnection.toUuid;
    var toParam = this.selectedConnection.toParam;
    var fromNode = this.getNode(fromUuid);
    var toNode = this.getNode(toUuid);

    node.position((fromNode.positionX + toNode.positionX) / 2, (fromNode.positionY + toNode.positionY) / 2);

    this.triggerDeleteConnection(this.selectedConnection);
    this.removeConnection(this.selectedConnection);

    var newNodeInputs = node.inputs;
    var newNodeOutputs = node.outputs;

    var connection = this.addConnection(null);
    this.setConnectionFromTo(connection.uuid, fromUuid, fromParam, uuid, newNodeInputs[0]);
    this.triggerCreateConnection(connection);

    if (node.outputs.length) {
      connection = this.addConnection(null);
      this.setConnectionFromTo(connection.uuid, uuid, newNodeOutputs[0], toUuid, toParam);
      this.triggerCreateConnection(connection);
    }
  } else if (this.selectedNode && this.selectedNode.outputs.length && node.inputs.length) {
    node.position(this.selectedNode.positionX + 225, this.selectedNode.positionY);
    var connection = this.addConnection(null);
    this.setConnectionFromTo(connection.uuid, this.selectedNode.uuid, this.selectedNode.outputs[0], node.uuid, node.inputs[0]);
    this.triggerCreateConnection(connection);
  } else {
    node.position(this.boardWidth / 2 - this.boardPositionX, this.boardHeight / 2 - this.boardPositionY);
  }

  return node;
};

NodeGraph.prototype.removeConnectionToOutputParam = function (uuid, param, exceptUuid) {
  for (var key in this.connections) {
    var connection = this.connections[key];
    if (connection.toUuid === uuid && connection.toParam === param && connection.uuid !== exceptUuid) {
      this.removeConnection(connection);
      this.triggerDeleteConnection(connection);
    }
  }

};

NodeGraph.prototype.removeNode = function (uuid) {
  var node = this.nodes[uuid];

  if (this.selectedNode === node) {
    node.unselect();
    this.selectedNode = null;
  }

  for (var key in this.connections) {
    var connection = this.connections[key];
    if (connection.isLinkedTo(node.uuid)) {
      this.triggerDeleteConnection(connection);
      this.removeConnection(connection);
    }
  }

  delete this.nodes[node.uuid];
  this.nodesLayer.removeChild(node.element);

  this.clearNodesInfoCache();
};

NodeGraph.prototype.removeConnection = function (connection) {
  if (this.draggedConnection === connection) {
    this.draggedConnection = null;
  }

  if (this.selectedConnection === connection) {
    connection.unselect();
    this.selectedConnection = null;
  }

  delete this.connections[connection.uuid];
  this.connectionsLayer.removeChild(connection.svg);

  this.clearNodesInfoCache();
};

NodeGraph.prototype.addConnection = function (uuid) {
  uuid = uuid || generateUUID();

  var connection = new Connection(uuid);
  this.connections[connection.uuid] = connection;

  this.connectionsLayer.appendChild(connection.svg);

  return connection;
};

NodeGraph.prototype.setConnectionFromTo = function (uuid, fromUuid, fromParam, toUuid, toParam) {
  var connection = this.connections[uuid];
  var fromPosition = this.getNode(fromUuid).getOutputPosition(fromParam);
  var toPosition = this.getNode(toUuid).getInputPosition(toParam);

  connection.setPath(fromPosition[0], fromPosition[1], toPosition[0], toPosition[1]);
  connection.setConnectedNodes(fromUuid, fromParam, toUuid, toParam);

  this.clearNodesInfoCache();
};

NodeGraph.prototype.setConnectionFrom = function (uuid, fromUuid, fromParam, x, y) {
  var connection = this.connections[uuid];
  var fromPosition = this.getNode(fromUuid).getOutputPosition(fromParam);

  connection.setPath(fromPosition[0], fromPosition[1], x - this.boardPositionX, y - this.boardPositionY);
  connection.setConnectedNodes(fromUuid, fromParam, null, null);

  this.clearNodesInfoCache();
};

NodeGraph.prototype.selectConnection = function (connection) {
  if (this.selectedConnection === connection) return;

  if (this.selectedConnection !== null) {
    this.selectedConnection.unselect();
  }

  this.selectedConnection = connection;

  if (this.selectedConnection !== null) {
    this.selectedConnection.select();
  }
};

NodeGraph.prototype.selectNode = function (node) {
  if (this.selectedNode === node) return;

  if (this.selectedNode !== null) {
    this.selectedNode.unselect();
  }

  this.selectedNode = node;

  if (this.selectedNode !== null) {
    this.selectedNode.select();
  }
};

NodeGraph.prototype.getNode = function (uuid) {
  var node = null;

  if (typeof uuid === 'string' && this.nodes.hasOwnProperty(uuid)) {
    node = this.nodes[uuid];
  }

  return node;
};

NodeGraph.prototype.showFullPreview = function (node) {
  globalEE.trigger('show-full-preview', node.uuid);
};

NodeGraph.prototype.displayParameters = function (node) {
  globalEE.trigger('display-parameters', node.uuid);
};

NodeGraph.prototype.orderedNodesPerDepth = null;
NodeGraph.prototype.accumulatedInputsPerNodes = null;

NodeGraph.prototype.clearNodesInfoCache = function () {
  this.orderedNodesPerDepth = null;
  this.accumulatedInputsPerNodes = null;
};

NodeGraph.prototype.updateNodesInfoCache = function () {
  var orderedNodes = [];
  var accumulatedInputs = {};

  var toSort = [];
  var inputMap = {};

  for (var key in this.connections) {
    if (this.connections[key].toUuid) {
      if (!inputMap.hasOwnProperty(this.connections[key].toUuid)) {
        inputMap[this.connections[key].toUuid] = [];
      }

      inputMap[this.connections[key].toUuid].push(this.connections[key].fromUuid);
    }
  }

  for (var uuid in this.nodes) {
    if (!inputMap.hasOwnProperty(uuid)) {
      orderedNodes.push(uuid);
      accumulatedInputs[uuid] = [];
    } else {
      toSort.push(uuid);
    }
  }

  while (toSort.length) {
    for (var i = toSort.length - 1; i >= 0; i--) {
      var connectedToUnseenNode = false;
      var uuid = toSort[i];

      for (var k = 0; k < inputMap[uuid].length && !connectedToUnseenNode; k++) {
        connectedToUnseenNode = toSort.includes(inputMap[uuid][k]);
      }

      if (!connectedToUnseenNode) {
        // remove the current node from the list to process
        toSort.splice(i, 1);

        // add current node in the flat array of ordered nodes
        orderedNodes.push(uuid);

        accumulatedInputs[uuid] = [];

        for (var k = 0; k < inputMap[uuid].length; k++) {
          accumulatedInputs[uuid] = accumulatedInputs[uuid].concat(inputMap[uuid][k], accumulatedInputs[inputMap[uuid][k]]);
        }

        accumulatedInputs[uuid] = uniqueArray(accumulatedInputs[uuid]);
      }
    }
  }

  this.orderedNodesPerDepth = orderedNodes;
  this.accumulatedInputsPerNodes = accumulatedInputs;
};

NodeGraph.prototype.getAccumulatedInputsForNode = function (nodeUuid) {
  if (this.accumulatedInputsPerNodes === null) {
    this.updateNodesInfoCache();
  }

  return this.accumulatedInputsPerNodes[nodeUuid];
};

NodeGraph.prototype.canConnectNodes = function (fromUuid, toUuid) {
  return fromUuid !== toUuid && !this.getAccumulatedInputsForNode(fromUuid).includes(toUuid);
};

NodeGraph.prototype.getNodesOrderedByDepth = function () {
  if (this.orderedNodesPerDepth === null) {
    this.updateNodesInfoCache();
  }

  return this.orderedNodesPerDepth;
};

NodeGraph.prototype.triggerCreateConnection = function (connection) {
  globalEE.trigger('create-connection', connection.uuid, connection.fromUuid, connection.fromParam, connection.toUuid, connection.toParam);
};

NodeGraph.prototype.triggerDeleteConnection = function (connection) {
  globalEE.trigger('delete-connection', connection.uuid);
};

module.exports = NodeGraph;
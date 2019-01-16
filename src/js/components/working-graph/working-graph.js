"use strict";

const Pulse = require('../pulse');
const globalEE = require('../event-emitter').global;

function WorkingGraph (context, size) {
  this.size = size;
  this.context = context;
  this.nodes = {};
  this.connections = {};
  this.jobQueue = null;
  this.waitingQueues = [];

  this.pulse = new Pulse((done) => {
    if (this.jobQueue === null && this.waitingQueues.length > 0) {
      this.jobQueue = this.waitingQueues.shift();
    }

    if (this.jobQueue !== null && this.jobQueue.jobs.length > 0) {
      this.executeNodeJob(this.jobQueue.jobs.shift(), () => {
        if (this.jobQueue!== null && this.jobQueue.jobs.length === 0) {
          this.jobQueue = null;
        }

        done();
      });
    } else {
      this.jobQueue = null;
      done();
    }
  });

  this.pulse.start();
}

WorkingGraph.prototype.context = null;

WorkingGraph.prototype.nodes = null;
WorkingGraph.prototype.connections = null;

WorkingGraph.prototype.createNode = function (uuid, type, parameters, miniCanvas, miniCanvasContext) {
  var textures = {};
  var inputRefs = {};
  var outputRefs = {};

  for(var i = 0; i < type.inputs.length; i++) {
    inputRefs[type.inputs[i]] = null;
  }

  for(i = 0; i < type.outputs.length; i++) {
    textures[type.outputs[i]] = this.context.createTexture(this.size, this.size, true);
    outputRefs[type.outputs[i]] = [];
  }

  this.nodes[uuid] = {
    type: type.id,
    job: type.job,
    parameters: parameters,
    miniCanvas: miniCanvas,
    miniCanvasContext: miniCanvasContext,
    inputRefs: inputRefs,
    outputRefs: outputRefs,
    outputTextures: textures,
    defaultTexture: textures[type.outputs[0]]
  };

  this.scheduleNodeJob(uuid);
};

WorkingGraph.prototype.setNodeCanvas = function (uuid, miniCanvas, miniCanvasContext) {
  this.nodes[uuid].miniCanvas = miniCanvas;
  this.nodes[uuid].miniCanvasContext = miniCanvasContext;
};

WorkingGraph.prototype.deleteNode = function (uuid) {
  for (var key in this.nodes[uuid].outputTextures) {
    this.nodes[uuid].outputTextures[key].dispose();
  }

  delete this.nodes[uuid];
};

WorkingGraph.prototype.scheduleAll = function () {
  // remove all previously scheduled work
  this.jobQueue = null;
  this.waitingQueues.length = 0;

  // search first level nodes

  var firstLevelNodes = [];

  for (var nodeUuid in this.nodes) {
    var nodeInputs = this.nodes[nodeUuid].inputRefs;
    var hasInputs = false;

    for (var key in nodeInputs) {
      if (nodeInputs[key] !== null && nodeInputs[key].length > 0) {
        hasInputs = true;
        break;
      }
    }

    if (!hasInputs) {
      firstLevelNodes.push(nodeUuid);
    }
  }

  // get whole ordered graph from first level nodes

  var ordered = this.getOrderedNodesFromStartPoints(...firstLevelNodes);

  // schedule the execution of the whole graph

  this.waitingQueues.push({
    root: '*',
    jobs: ordered
  });
};

WorkingGraph.prototype.getOrderedNodesFromStartPoints = function (...uuids) {
  var depths = {};

  const setNode = (nodeUuid) => {
    var depth = 0;

    for (var key in this.nodes[nodeUuid].inputRefs) {
      if (this.nodes[nodeUuid].inputRefs[key] !== null && depths.hasOwnProperty(this.nodes[nodeUuid].inputRefs[key][0])) {
        depth = Math.max(depth, depths[this.nodes[nodeUuid].inputRefs[key][0]] + 1);
      }
    }

    depths[nodeUuid] = depth;

    for (var key in this.nodes[nodeUuid].outputRefs) {
      for (var i = 0; i < this.nodes[nodeUuid].outputRefs[key].length; i++) {
        setNode(this.nodes[nodeUuid].outputRefs[key][i][0]);
      }
    }
  };

  for (var i = 0; i < uuids.length; i++) {
    setNode(uuids[i]);
  }

  var arrayToOrder = [];

  for (var key in depths) {
    arrayToOrder.push([key, depths[key]]);
  }

  var ordered = arrayToOrder.sort(function (a,b) { return a[1] - b[1]; }).reduce(function (a, v) { a.push(v[0]); return a; }, []);

  return ordered;
};

WorkingGraph.prototype.scheduleNodeJob = function (uuid) {

  var ordered = this.getOrderedNodesFromStartPoints(uuid);

  // remove current jobQueue if same root
  if (this.jobQueue !== null && this.jobQueue.root === uuid) {
    this.jobQueue = null;
  }

  // remove queue in the waiting list if same root
  for (var i = this.waitingQueues.length - 1; i >= 0; i--) {
    if (this.waitingQueues[i].root === uuid) {
      this.waitingQueues.splice(i, 1);
    }
  }

  this.waitingQueues.push({
    root: uuid,
    jobs: ordered
  });
};

var jobid = 0;

WorkingGraph.prototype.executeNodeJob = function (uuid, done) {
  //console.time('process-' + uuid);

  var node = this.nodes[uuid];

  if (node) {
    var inputTextures = {};

    for (var input in node.inputRefs) {
      var ref = node.inputRefs[input];
      inputTextures[input] = ref !== null ? this.nodes[ref[0]].outputTextures[ref[1]] : null;
    }

    node.job(this.context, inputTextures, node.outputTextures, node.parameters, () => {
      this.context.drawToCanvas(node.miniCanvas, node.miniCanvasContext, node.defaultTexture);
      globalEE.trigger('update-texture', uuid, node.defaultTexture);
      //console.timeEnd('process-' + uuid);
      done();
    });
  } else {
    done();
  }
};

WorkingGraph.prototype.createConnection = function (connectionUuid, fromUuid, fromParam, toUuid, toParam, noJob) {
  this.connections[connectionUuid] = {
    fromUuid: fromUuid,
    fromParam: fromParam,
    toUuid: toUuid,
    toParam: toParam
  };

  this.nodes[fromUuid].outputRefs[fromParam].push([toUuid, toParam]);
  this.nodes[toUuid].inputRefs[toParam] = [fromUuid, fromParam];

  if (!noJob) {
    this.scheduleNodeJob(toUuid);
  }
};

WorkingGraph.prototype.deleteConnection = function (connectionUuid) {
  const { fromUuid, fromParam, toUuid, toParam } = this.connections[connectionUuid];

  this.nodes[fromUuid].outputRefs[fromParam] = this.nodes[fromUuid].outputRefs[fromParam].reduce((a, v) => {
    if (v[0] !== toUuid || v[1] !== toParam) {
      a.push(v);
    }

    return a;
  }, []);
  this.nodes[toUuid].inputRefs[toParam] = null;

  delete this.connections[connectionUuid];

  this.scheduleNodeJob(toUuid);
};

WorkingGraph.prototype.getNode = function (nodeUuid) {
  var node = null;

  if (typeof nodeUuid === 'string' && this.nodes.hasOwnProperty(nodeUuid)) {
    node = this.nodes[nodeUuid];
  }

  return node;
};

module.exports = WorkingGraph;
"use strict";

function WorkingGraph (context) {
  this.context = context;
  this.nodes = {};
  this.connections = {};
}

WorkingGraph.prototype.context = null;

WorkingGraph.prototype.nodes = null;
WorkingGraph.prototype.connections = null;

WorkingGraph.prototype.createNode = function (uuid, type) {
  var textures = {};
  var inputRefs = {};
  var outputRefs = {};

  for(var i = 0; i < type.inputs.length; i++) {
    inputRefs[type.inputs[i]] = null;
  }

  for(i = 0; i < type.outputs.length; i++) {
    textures[type.outputs[i]] = this.context.createTexture(512, 512, true);
    outputRefs[type.outputs[i]] = null;
  }

  this.nodes[uuid] = {
    type: type.id,
    job: type.job,
    inputRefs: inputRefs,
    outputRefs: outputRefs,
    outputTextures: textures
  };

  console.log(this.nodes[uuid]);
};

WorkingGraph.prototype.deleteNode = function (uuid) {
  for (var key in this.nodes[uuid].outputTextures) {
    this.nodes[uuid].outputTextures[key].dispose();
  }

  delete this.nodes[uuid];
};

WorkingGraph.prototype.executeNodeJob = function (uuid, paramValues, canvas, canvasCtx) {
  console.time('process-' + uuid);


  var node = this.nodes[uuid];

  var inputTextures = {};

  for (var input in node.inputRefs) {
    var ref = node.inputRefs[input];
    inputTextures[input] = ref !== null ? this.nodes[ref[0]].outputTextures[ref[1]] : null;
  }

  node.job(this.context, inputTextures, node.outputTextures, paramValues, () => {
    console.timeEnd('process-' + uuid);
    this.context.drawToCanvas(canvas, canvasCtx, node.outputTextures.output);
  });
};

WorkingGraph.prototype.createConnection = function (connectionUuid, fromUuid, fromParam, toUuid, toParam) {
  this.connections[connectionUuid] = {
    fromUuid: fromUuid,
    fromParam: fromParam,
    toUuid: toUuid,
    toParam: toParam
  };

  this.nodes[fromUuid].outputRefs[fromParam] = [toUuid, toParam];
  this.nodes[toUuid].inputRefs[toParam] = [fromUuid, fromParam];

  console.log('trigger change on node', toUuid);
};

WorkingGraph.prototype.deleteConnection = function (connectionUuid) {
  const { fromUuid, fromParam, toUuid, toParam } = this.connections[connectionUuid];

  this.nodes[fromUuid].outputRefs[fromParam] = null;
  this.nodes[toUuid].inputRefs[toParam] = null;

  delete this.connections[connectionUuid];

  console.log('trigger change on node', toUuid);
};

WorkingGraph.prototype.getNode = function (nodeUuid) {
  var node = null;

  if (typeof nodeUuid === 'string' && this.nodes.hasOwnProperty(nodeUuid)) {
    node = this.nodes[nodeUuid];
  }

  return node;
};

module.exports = WorkingGraph;
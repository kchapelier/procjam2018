"use strict";

var { makeElement } = require('./../../commons/utils');

function Node (uuid, type) {
  this.uuid = uuid;

  this.element = makeElement('div', { className: 'node', 'data-uuid': this.uuid });
  this.canvas = makeElement('canvas', { width: 96, height: 96 });
  this.canvasCtx = this.canvas.getContext('2d');

  this.element.appendChild(this.canvas);

  const inputsContainer = makeElement('div', { className: 'inputs' });

  this.inputs = type.inputs;
  this.inputPositions = {};

  for (let i = 0; i < this.inputs.length; i++) {
    const input = makeElement('div', { className: 'input' });
    const connector = makeElement('span', { className: 'anchor anchor-input', 'data-name': this.inputs[i], 'data-uuid': this.uuid });
    const label = makeElement('span', { className: 'label', innerText: this.inputs[i] });
    input.appendChild(connector);
    input.appendChild(label);
    inputsContainer.appendChild(input);

    this.inputPositions[this.inputs[i]] = [-50, 16 + 20 * i - 50];
  }

  this.element.appendChild(inputsContainer);

  const outputsContainer = makeElement('div', { className: 'outputs' });

  this.outputs = type.outputs;
  this.outputPositions = {};

  for (let i = 0; i < this.outputs.length; i++) {
    const output = makeElement('div', { className: 'output' });
    const connector = makeElement('span', { className: 'anchor anchor-output', 'data-name': this.outputs[i], 'data-uuid': this.uuid });
    const label = makeElement('span', { className: 'label', innerText: this.outputs[i] });
    output.appendChild(connector);
    output.appendChild(label);
    outputsContainer.appendChild(output);

    this.outputPositions[this.outputs[i]] = [50, 16 + 20 * i - 50];
  }

  this.element.appendChild(outputsContainer);

  this.element.appendChild(makeElement('span', { className: 'node-label', innerText: type.name }));

  this.position(0, 0);
}

Node.prototype.position = function (x, y) {
  this.positionX = x;
  this.positionY = y;
  this.element.style.transform = 'translate(' + this.positionX + 'px,' + this.positionY + 'px)';
};

Node.prototype.getOutputPosition = function (name) {
  return [
    this.positionX + this.outputPositions[name][0],
    this.positionY + this.outputPositions[name][1]
  ];
};

Node.prototype.getInputPosition = function (name) {
  return [
    this.positionX + this.inputPositions[name][0],
    this.positionY + this.inputPositions[name][1]
  ];
};

Node.prototype.select = function () {
  this.element.classList.add('selected');

  this.element.parentNode.appendChild(this.element); // bring to front
};

Node.prototype.unselect = function () {
  this.element.classList.remove('selected');
};

module.exports = Node;
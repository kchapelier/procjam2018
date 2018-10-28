"use strict";

var { makeElement } = require('./../../commons/utils');

function Connection (uuid) {
  this.uuid = uuid;

  this.svg = makeElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    version: '1.1',
    width: '20px',
    height: '20px',
    viewBox: '0 0 20 20',
    'data-uuid': this.uuid
  });

  this.displayPath = makeElement('path', { className: 'display-path', d: 'M0 0' });
  this.interactivePath = makeElement('path', { className: 'interactive-path', d: 'M0 0' });

  this.svg.appendChild(this.displayPath);
  this.svg.appendChild(this.interactivePath);
}

Connection.prototype.setPath = function (x1, y1, x2, y2) {
  var minX = Math.min(x1, x2);
  var maxX = Math.max(x1, x2);
  var minY = Math.min(y1, y2);
  var maxY = Math.max(y1, y2);
  var width = maxX - minX;
  var height = maxY - minY;

  this.svg.setAttribute('width',  (width + 50) + 'px');
  this.svg.setAttribute('height',  (height + 50) + 'px');
  this.svg.setAttribute('viewBox',  '0 0 ' + (width + 50) + ' ' + (height + 50));
  this.svg.style.transform = 'translate(' + (minX - 25) + 'px, ' + (minY - 25) + 'px)';

  x1 -= minX - 25;
  x2 -= minX - 25;
  y1 -= minY - 25;
  y2 -= minY - 25;

  var dist = Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), 0.5);
  var a = 6 * Math.pow(Math.min(dist / 60, 1), 0.9);
  var b = 33 * Math.pow(Math.min(dist / 120, 1), 0.8);

  var cx = (x1 + x2) / 2;
  var cy = (y1 + y2) / 2;

  var d = 'M ' + x1 + ' ' + y1 + '  C ' + (x1 + a) + ',' + y1 + ' ' + (x1 + b) + ',' + y1 + ' ' + cx + ','  + cy + ' C ' + (x2 - b) + ',' + y2 + ' ' + (x2 - a) + ',' + y2 + ' ' + x2 + ',' + y2;

  this.displayPath.setAttribute('d', d);
  this.interactivePath.setAttribute('d', d);
};

Connection.prototype.select = function () {
  this.svg.classList.add('selected');
};

Connection.prototype.unselect = function () {
  this.svg.classList.remove('selected');
};

Connection.prototype.setConnectedNodes = function (fromUuid, fromParam, toUuid, toParam) {
  this.fromUuid = fromUuid;
  this.fromParam = fromParam;
  this.toUuid = toUuid;
  this.toParam = toParam;
};

Connection.prototype.isLinkedTo = function (nodeUuid) {
  return this.fromUuid === nodeUuid || this.toUuid === nodeUuid;
};

module.exports = Connection;
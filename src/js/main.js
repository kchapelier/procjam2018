"use strict";

var TextWidget = require('./components/widgets/text');
var BooleanWidget = require('./components/widgets/boolean');
var ImageWidget = require('./components/widgets/image');
var RangeWidget = require('./components/widgets/range');
var SelectWidget = require('./components/widgets/select');
var VectorWidget = require('./components/widgets/vector');
var DescriptionWidget = require('./components/widgets/description');
var AngleWidget = require('./components/widgets/angle');

//var Pool = require('./commons/pool');

window.onload = function () {
  var column = document.getElementById('column');

  var t = new TextWidget();
  t.initialize('Text', 'value', { regex: /[a-z]*/}, function (a) { console.log(a); });
  t.injectIn(column);

  var b = new BooleanWidget();
  b.initialize('Boolean', false, {}, function (a) { console.log(a); });
  b.injectIn(column);

  var i = new ImageWidget();
  i.initialize('Image', false, {}, function (a) { console.log(a); });
  i.injectIn(column);

  var r = new RangeWidget();
  r.initialize('Range', 0, { hardMin: 0, hardMax: 5, softMin: 0, softMax: 1, steps: 0.0001 }, function (a) { console.log(a); });
  r.injectIn(column);

  var s = new SelectWidget();
  s.initialize('Select', 0, { options: [[0, 'No'], [1, 'Yes']] }, function (a) { console.log(a); });
  s.injectIn(column);

  var v = new VectorWidget();
  v.initialize('Vector', [], { items: 3, hardMin: 0, hardMax: 5, softMin: 0, softMax: 1, steps: 0.0001 }, function (a) { console.log(a); });
  v.injectIn(column);

  var d = new DescriptionWidget();
  d.initialize('Description\nwhat', null, null, null);
  d.injectIn(column);

  var a = new AngleWidget();
  a.initialize('Angle', 0, { }, function (a) { console.log(a); });
  a.injectIn(column);
};
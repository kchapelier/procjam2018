"use strict";

function Pulse (callback, maxTime) {
  this.raf = null;

  var busy = false;
  var start = 0;
  var maxTime = maxTime || 0;
  var self = this;

  var doneFunc = function doneFunc () {
    if (Date.now() - start < maxTime) {
      tickFunc();
    } else {
      busy = false;
    }
  };

  var tickFunc = function tickFunc () {
    busy = true;
    callback(doneFunc);
  };

  this.loopFunc = function loopFunc () {
    if (busy === false) {
      start = Date.now();
      tickFunc();
    }

    self.raf = requestAnimationFrame(self.loopFunc);
  };
}

Pulse.prototype.start = function () {
  if (this.raf === null) {
    this.raf = requestAnimationFrame(this.loopFunc);
  }
};

Pulse.prototype.stop = function () {
  if (this.raf !== null) {
    cancelAnimationFrame(this.raf);
    this.raf = null;
  }
};

module.exports = Pulse;
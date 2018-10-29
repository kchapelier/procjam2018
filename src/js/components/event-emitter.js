"use strict";

function EventEmitter () {
  this.listeners = {};
}

EventEmitter.prototype.listeners = null;

EventEmitter.prototype.on = function (event, func) {
  if (!this.listeners.hasOwnProperty(event)) {
    this.listeners[event] = [];
  }

  this.listeners[event].push(func);
};

EventEmitter.prototype.off = function (event, func) {
  if (this.listeners.hasOwnProperty(event)) {
    if (!func) {
      delete this.listeners[event];
    } else {
      var eventListeners = [];

      for (var i = 0; i < this.listeners[event].length; i++) {
        if (this.listeners[event][i] !== func) {
          eventListeners.push(this.listeners[event][i]);
        }
      }

      this.listeners[event] = eventListeners;
    }
  }
};

EventEmitter.prototype.trigger = function (event, ...args) {
  if (this.listeners.hasOwnProperty(event)) {
    for (var i = 0; i < this.listeners[event].length; i++) {
      this.listeners[event][i](...args);
    }
  }
};

EventEmitter.global = new EventEmitter();

module.exports = EventEmitter;
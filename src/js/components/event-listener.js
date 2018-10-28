"use strict";

function EventListener () {
  this.listeners = {};
}

EventListener.prototype.listeners = null;

EventListener.prototype.on = function (event, func) {
  if (!this.listeners.hasOwnProperty(event)) {
    this.listeners[event] = [];
  }

  this.listeners[event].push(func);
};

EventListener.prototype.off = function (event, func) {
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

EventListener.prototype.trigger = function (event, ...args) {
  if (this.listeners.hasOwnProperty(event)) {
    for (var i = 0; i < this.listeners[event].length; i++) {
      this.listeners[event][i](...args);
    }
  }
};

EventListener.global = new EventListener();

module.exports = EventListener;
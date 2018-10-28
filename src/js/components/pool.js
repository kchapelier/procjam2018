"use strict";

function Pool () {
  this.types = {};
  this.instances = {};
  this.availabilities = new WeakMap();
}

Pool.prototype.types = null;
Pool.prototype.instances = null;
Pool.prototype.availabilities = null;

/**
 *
 * @param {string} typeId
 * @param {function} typeConstructor
 */
Pool.prototype.registerType = function (typeId, typeConstructor) {
  this.types[typeId] = typeConstructor;
  this.instances[typeId] = [];
};

/**
 *
 * @param {string} typeId
 * @returns {object}
 */
Pool.prototype.getInstance = function (typeId) {
  let instance = null;

  for (let i = 0; i < this.instances[typeId].length; i++) {
    if (this.availabilities.get(this.instances[typeId][i])) {
      instance = this.instances[typeId][i];
      break;
    }
  }

  if (instance === null) {
    instance = new this.types[typeId]();
    this.instances[typeId].push(instance);
  }

  this.availabilities.set(instance, false);

  return instance;
};

/**
 *
 * @param {object} instance
 */
Pool.prototype.freeInstance = function (instance) {
  this.availabilities.set(instance, true);
};

module.exports = Pool;
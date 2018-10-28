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
 * Register a "type".
 *
 * @param {string} typeId
 * @param {function} typeConstructor
 */
Pool.prototype.registerType = function (typeId, typeConstructor) {
  this.types[typeId] = typeConstructor;
  this.instances[typeId] = [];
};

/**
 * Request an instance of a specific "type".
 *
 * @param {string} typeId
 * @returns {object}
 */
Pool.prototype.getInstance = function (typeId) {
  let instance = null;
  const typeInstances = this.instances[typeId];

  for (let i = 0; i < typeInstances.length; i++) {
    if (this.availabilities.get(typeInstances[i])) {
      instance = typeInstances[i];
      break;
    }
  }

  if (instance === null) {
    instance = new this.types[typeId]();
    typeInstances.push(instance);
  }

  this.availabilities.set(instance, false);

  return instance;
};

/**
 * Free an instance, making it available again from the pool.
 *
 * @param {object} instance
 */
Pool.prototype.freeInstance = function (instance) {
  this.availabilities.set(instance, true);
};

module.exports = Pool;
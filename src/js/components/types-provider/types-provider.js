"use strict";

function TypesProvider () {
  this.types = {};
}

TypesProvider.prototype.registerType = function (infos) {
  this.types[infos.id] = infos;
};

TypesProvider.prototype.getAllTypes = function () {
  return Object.values(this.types);
};

TypesProvider.prototype.getType = function (type) {
  return this.types[type];
};

module.exports = TypesProvider;
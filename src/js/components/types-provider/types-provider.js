"use strict";

function TypesProvider () {
  this.types = {};
}

TypesProvider.prototype.setType = function (key, infos) {
  this.types[key] = infos;
};

TypesProvider.prototype.getAllTypes = function () {
  return Object.values(this.types);
};

TypesProvider.prototype.getType = function (type) {
  return this.types[type];
};

module.exports = TypesProvider;
"use strict";

function getProp (object, prop, defaultValue) {
  if (object && object.hasOwnProperty(prop)) {
    return object[prop];
  } else {
    return defaultValue;
  }
}

const generateUUID = (function () {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let rnd = 0;
  let r = 0;

  const table = [];

  for (let i = 0; i < 256; i++) {
    table[i] = chars[i >> 4] + chars[i & 0xF];
  }

  return function generateUUID () {
    let uuid = '';
    let tmp = 0;
    let value = 0;

    for (let i = 0; i < 31; i++) {
      if (rnd <= 0x02) {
        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      }

      r = rnd & 0xf;
      rnd = rnd >> 4;
      value = (i === 15) ? (r & 0x3) | 0x8 : r;

      if ((i%2) === 0) {
        tmp = value;
      } else {
        uuid += table[(tmp << 4) | value];
      }
    }

    uuid += chars[tmp];

    return uuid;
  };
})();

const makeElement = (function () {
  const directAccessProperties = ['className', 'innerText', 'innerHTML'];
  const svgElements = ['svg', 'path', 'circle'];

  return function makeElement (tag, props) {
    const isSvg = svgElements.indexOf(tag) >= 0;
    const element = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);

    if (props) {
      const keys = Object.keys(props);

      for (let i = 0; i < keys.length; i++) {
        const key = isSvg && keys[i] === 'className' ? 'class' : keys[i];

        if (directAccessProperties.indexOf(key) !== -1) {
          element[key] = props[keys[i]];
        } else {
          element.setAttribute(key, props[keys[i]]);
        }
      }
    }

    return element;
  };
})();

const uniqueArray = function uniqueArray (array) {
  return array.filter(function(elem, pos, arr) {
    return arr.indexOf(elem) === pos;
  });
};

function simplifyString (string) {
  return string.toLowerCase().replace(/[\s\-_,()]+/g, ' ').trim();
}

function arrayToRgb (array) {
  return '#' + ('0' + array[0].toString(16)).substr(-2) + ('0' + array[1].toString(16)).substr(-2) + ('0' + array[2].toString(16)).substr(-2);
}

function extendClass (ctor, proto) {
  ctor.super = proto;
  ctor.prototype = Object.create(proto.prototype);
  ctor.prototype.constructor = ctor;
}

module.exports = {
  arrayToRgb: arrayToRgb,
  generateUUID: generateUUID,
  getProp: getProp,
  makeElement: makeElement,
  uniqueArray: uniqueArray,
  simplifyString: simplifyString,
  extendClass: extendClass
};
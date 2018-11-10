"use strict";

var element = null;
var previousUrl = null;

function getElement () {
  if (element === null) {
    element = document.createElement('a');
    element.innerText = 'Download';
    element.style.position = 'absolute';
    element.style.top = '-100px';
    element.style.left = '0px';
  }

  return element;
}

function getObjectUrl (contents, type) {
  var blob;

  if (typeof contents === 'object' && contents.constructor.name === 'Blob') {
    blob = contents;
  } else {
    blob = new Blob(contents, {
      type: type
    });
  }

  var url = URL.createObjectURL(blob);

  if (previousUrl !== null && URL.revokeObjectURL) {
    URL.revokeObjectURL(previousUrl);
  }

  previousUrl = url;

  return url;
}

function download (contents, type, filename) {
  var element = getElement();
  var url = getObjectUrl(contents, type);

  element.setAttribute('href', url);
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


module.exports = download;
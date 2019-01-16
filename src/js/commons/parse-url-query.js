"use strict";

const validSizes = [16, 32, 64, 128, 256, 518, 1024, 2048, 4096];

function normalizeSize (value) {
  var result = 1024;
  value = parseInt(value, 10);

  if (value > 0 && !isNaN(value)) {
    for (var i = 0; value >= validSizes[i]; i++) {
      result = validSizes[i];
    }
  }

  return result;
}

function parseUrlQuery () {
  var data = {
    gist: null,
    size: 1024
  };

  document.location.search.split(/[?&]/g).map(function(option) {
    option = option.split('=');

    switch (option[0]) {
      case 'gist':
        data.gist = option[1];
        break;
      case 'size':
        data.size = normalizeSize(option[1]);
        break;
    }
  });

  return data;
}

module.exports = parseUrlQuery;
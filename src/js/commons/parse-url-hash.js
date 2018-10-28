"use strict";

function parseUrlHash () {
  var data = {
    gist: null
  };

  document.location.hash.split(/[#&]/g).map(function(option) {
    option = option.split('=');

    switch (option[0]) {
      case 'gist':
        data.gist = option[1];
        break;
    }
  });

  return data;

}

module.exports = parseUrlHash;
"use strict";

function normalizeLessThan6 (save) {
  // node types : replace 'wrap' by 'warp' and 'directional wrap' by 'directional warp'
  for (var key in save.nodes) {
    if (save.nodes[key].type === 'wrap') {
      save.nodes[key].type = 'warp';
    } else if (save.nodes[key].type === 'directional-wrap') {
      save.nodes[key].type = 'directional-warp';
    }
  }

  return save;
}

function normalizeSave (save) {
  if (save.version < 6) {
    save = normalizeLessThan6(save);
  }

  return save;
}

module.exports = normalizeSave;
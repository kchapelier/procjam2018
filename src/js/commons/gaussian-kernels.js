"use strict";

// based on https://warpycode.wordpress.com/2009/04/13/computing-a-1d-gaussian-kernel/

const sqr2pi = Math.sqrt(2 * Math.PI);

function getKernel (size, sigma) {
  // ensure size is even and prepare variables
  const width = (size / 2) | 0;
  const kernel = new Array(width * 2 + 1);
  const norm = 1.0 / (sqr2pi * sigma);
  const coefficient = 2 * sigma * sigma;

  let total = 0;

  // set values and increment total
  for (let x = -width; x <= width; x++) {
    total += kernel[width + x] = norm * Math.exp(-x * x / coefficient);
  }

  // divide by total to make sure the sum of all the values is equal to 1
  for (let x = 0; x < kernel.length; x++) {
    kernel[x] /= total;
  }

  return kernel;
}

function getTruncatedKernel (size, sigma) {
  return getKernel(size, sigma).slice(size / 2 | 0);
}

function getTruncateKernelForLinearFilter (size, sigma) {
  // basically a variant of http://rastergrid.com/blog/2010/09/efficient-gaussian-blur-with-linear-sampling/
  var truncatedKernel = getTruncatedKernel(size, sigma);

  var weights = [];
  var offsets = [];
  var start = 0;

  if (truncatedKernel.length % 2 > 0) {
    weights.push(truncatedKernel[0]);
    offsets.push(0.);
    start = 1;
  }

  for (var i = start; i < truncatedKernel.length; i+=2) {
    var sum = truncatedKernel[i] + truncatedKernel[i + 1];


    weights.push(sum);
    offsets.push(i + (sum > 0. ? truncatedKernel[i + 1] / sum : 0.));
  }

  return {
    weights: weights,
    offsets: offsets
  }
}

module.exports = {
  getKernel: getKernel,
  getTruncatedKernel: getTruncatedKernel,
  getTruncateKernelForLinearFilter: getTruncateKernelForLinearFilter
};
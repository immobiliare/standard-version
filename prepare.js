'use strict';

let isCi = false;

try {
  isCi = require('is-ci');
} catch (_) {
  isCi = true;
}

console.log('is-ci :>> ', isCi);

if (!isCi) {
  require('husky').install();
}

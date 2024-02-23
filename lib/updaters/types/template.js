const Handlebars = require('handlebars');

/* eslint-disable no-unused-vars */
module.exports.readVersion = function (_contents) {
  return '{{ version }}';
};

/* eslint-enable no-unused-vars */
module.exports.writeVersion = function (contents, version) {
  return Handlebars.compile(contents)({ version });
};

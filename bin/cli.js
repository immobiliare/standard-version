#!/usr/bin/env node

const { engines } = require('../package.json');

/* istanbul ignore if */
if (process.version.match(/v(\d+)\./)[1] < 6) {
  console.error(
    `standard-version: Node ${engines['node']}  or greater is required. 'standard-version' did not run.`
  );
} else {
  const standardVersion = require('../index');
  const cmdParser = require('../command');
  standardVersion(cmdParser.argv).catch((err) => {
    throw err;
  });
}

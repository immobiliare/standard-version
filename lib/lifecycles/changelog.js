const chalk = require('chalk');
const checkpoint = require('../checkpoint');
const conventionalChangelog = require('conventional-changelog');
const fs = require('fs');
const presetLoader = require('../preset-loader');
const runLifecycleScript = require('../run-lifecycle-script');
const writeFile = require('../write-file');

const START_OF_LAST_RELEASE_PATTERN =
  /(^#+ \[?[0-9]+\.[0-9]+\.[0-9]+|<a name=)/m;

async function Changelog(args, newVersion, oldVersion) {
  if (args.skip.changelog) return;
  await runLifecycleScript(args, 'prechangelog');
  const changelog = await outputChangelog(args, newVersion, oldVersion);
  await runLifecycleScript(args, 'postchangelog');
  return changelog;
}

Changelog.START_OF_LAST_RELEASE_PATTERN = START_OF_LAST_RELEASE_PATTERN;

module.exports = Changelog;

async function outputChangelog(args, newVersion, oldVersion) {
  return new Promise((resolve, reject) => {
    const PRERELEASE_PATTERN = new RegExp(
      `[${
        args.tagPrefix || ''
      }?[0-9]{1,}.[0-9]{1,}.[0-9]{1,}-([a-zA-Z]+.)?[0-9]{1,}]`,
      'gi'
    );

    createIfMissing(args);
    const header = args.header;

    let oldContent = args.dryRun ? '' : fs.readFileSync(args.infile, 'utf-8');
    const oldContentStart = oldContent.search(START_OF_LAST_RELEASE_PATTERN);
    // find the position of the last release and remove header:
    if (oldContentStart !== -1) {
      oldContent = oldContent.substring(oldContentStart);
    }
    let content = '';
    const context = { version: newVersion };

    if (args.gitSemverTags) {
      context.gitSemverTags = args.gitSemverTags;
    }

    const versionRange = oldVersion ? { from: oldVersion } : {};
    const changelogStream = conventionalChangelog(
      {
        debug:
          args.verbose && console.info.bind(console, 'conventional-changelog'),
        preset: presetLoader(args),
        tagPrefix: args.tagPrefix,
      },
      context,
      { merges: null, path: args.path, ...versionRange }
    ).on('error', function (err) {
      return reject(err);
    });

    changelogStream.on('data', function (buffer) {
      const row = buffer.toString();
      // if we've activated merging of release+prerelease changelog skip
      if (!args.changelogIncludesPrereleases && row.match(PRERELEASE_PATTERN)) {
        return;
      }
      content += row;
    });

    changelogStream.on('end', function () {
      checkpoint(args, 'outputting changes to %s', [args.infile]);
      if (args.dryRun) {
        console.info(`\n---\n${chalk.gray(content.trim())}\n---\n`);
      } else {
        writeFile(
          args,
          args.infile,
          header + '\n' + (content + oldContent).replace(/\n+$/, '\n')
        );
      }
      return resolve(
        header + '\n' + (content + oldContent).replace(/\n+$/, '\n')
      );
    });
  });
}

function createIfMissing(args) {
  try {
    fs.accessSync(args.infile, fs.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      checkpoint(args, 'created %s', [args.infile]);
      args.outputUnreleased = true;
      writeFile(args, args.infile, '\n');
    }
  }
}

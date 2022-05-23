const bump = require('./lib/lifecycles/bump');
const changelog = require('./lib/lifecycles/changelog');
const commit = require('./lib/lifecycles/commit');
const fs = require('fs');
const latestSemverTag = require('./lib/latest-semver-tag');
const path = require('path');
const printError = require('./lib/print-error');
const tag = require('./lib/lifecycles/tag');
const { resolveUpdaterObjectFromArgument } = require('./lib/updaters');

module.exports = async function standardVersion(argv) {
  const defaults = require('./defaults');
  /**
   * `--message` (`-m`) support will be removed in the next major version.
   */
  const message = argv.m || argv.message;
  if (message) {
    /**
     * The `--message` flag uses `%s` for version substitutions, we swap this
     * for the substitution defined in the config-spec for future-proofing upstream
     * handling.
     */
    argv.releaseCommitMessageFormat = message.replace(/%s/g, '{{currentTag}}');
    if (!argv.silent) {
      console.warn(
        '[standard-version]: --message (-m) will be removed in the next major release. Use --releaseCommitMessageFormat.'
      );
    }
  }

  if (argv.changelogHeader) {
    argv.header = argv.changelogHeader;
    if (!argv.silent) {
      console.warn(
        '[standard-version]: --changelogHeader will be removed in the next major release. Use --header.'
      );
    }
  }

  if (
    argv.header &&
    argv.header.search(changelog.START_OF_LAST_RELEASE_PATTERN) !== -1
  ) {
    throw Error(
      `custom changelog header must not match ${changelog.START_OF_LAST_RELEASE_PATTERN}`
    );
  }

  /**
   * If an argument for `packageFiles` provided, we include it as a "default" `bumpFile`.
   */
  if (argv.packageFiles) {
    defaults.bumpFiles = defaults.bumpFiles.concat(argv.packageFiles);
  }

  const args = Object.assign({}, defaults, argv);
  let pkg;
  for (const packageFile of args.packageFiles) {
    const updater = resolveUpdaterObjectFromArgument(packageFile);
    if (!updater) return;
    const pkgPath = path.resolve(process.cwd(), updater.filename);
    try {
      const contents = fs.readFileSync(pkgPath, 'utf8');
      pkg = {
        version: updater.updater.readVersion(contents),
        private:
          typeof updater.updater.isPrivate === 'function'
            ? updater.updater.isPrivate(contents)
            : false,
      };
      break;
      // eslint-disable-next-line no-empty
    } catch {}
  }
  try {
    let version;
    if (pkg) {
      version = pkg.version;
    } else if (args.gitTagFallback) {
      [version] = await latestSemverTag(1, {
        tagPrefix: args.tagPrefix,
      });
    } else {
      throw new Error('no package file found');
    }

    const versions = await latestSemverTag(0, {
      changelogIncludesPrereleases: args.changelogIncludesPrereleases,
      withPrefix: true,
      tagPrefix: args.tagPrefix,
    });

    // When using this feature the whole changelog is regenerated
    // this is usefull/needed when using standard-version on an existing project
    // with a previeous changelog and you want to recreate it using the new format
    if (args.regenerateChangelog) {
      return {
        changelog: await changelog(
          {
            ...args,
            changelogIncludesPrereleases: args.changelogIncludesPrereleases,
            gitSemverTags: versions,
          },
          versions[0],
          versions[versions.length - 1]
        ),
      };
    }

    const newVersion = await bump(args, version);

    // the new version is not there if for example we're dry-running
    if (versions[0] !== newVersion) {
      versions.unshift(newVersion);
    }

    const generatedChangelog = await changelog(
      {
        ...args,
        changelogIncludesPrereleases: args.changelogIncludesPrereleases,
        gitSemverTags: versions,
      },
      newVersion,
      // provide the old version only if we're on doing tag-to-tag changelog
      // this is to maintain backward compatibility with existing behaviour
      !args.changelogIncludesPrereleases ? versions[1] : undefined // oldVersion
    );
    const commitMsg = await commit(args, newVersion);
    await tag(newVersion, pkg ? pkg.private : false, args);
    return {
      changelog: generatedChangelog,
      version: args.tagPrefix + newVersion,
      commit: commitMsg,
    };
  } catch (err) {
    printError(args, err.message);
    throw err;
  }
};

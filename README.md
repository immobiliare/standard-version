<h1 align="center">Standard Version</h1>

![ci](https://github.com/immobiliare/standard-version/workflows/test/badge.svg)
[![NPM version](https://img.shields.io/npm/v/standard-version.svg)](https://www.npmjs.com/package/standard-version)
[![codecov](https://codecov.io/gh/immobiliare/standard-version/branch/main/graph/badge.svg?token=J7zMN7vTTd)](https://codecov.io/gh/immobiliare/standard-version)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> **Note:** This repository is a **fork** of the well known [conventional-changelog/standard-version](https://github.com/immobiliare/standard-version) which is no longer maintained, we indend to keep it working while adding some small utilities we need in our day-to-day, but we won't do ground breaking features since today there are more viable options.

A utility for versioning using [semver](https://semver.org/) and CHANGELOG generation powered by [Conventional Commits](https://conventionalcommits.org).

_Having problems? Want to contribute? Open a issue!_

## Table of Content

<!-- toc -->

- [How It Works](#how-it-works)
  - [`bumpFiles`, `packageFiles` and `updaters`](#bumpfiles-packagefiles-and-updaters)
- [Installing `standard-version`](#installing-standard-version)
  - [As a local `npm run` script](#as-a-local-npm-run-script)
  - [As global `bin`](#as-global-bin)
  - [Using `npx`](#using-npx)
- [Configuration](#configuration)
  - [Customizing CHANGELOG Generation](#customizing-changelog-generation)
    - [Compact changelog by non-prerelease tags only](#compact-changelog-by-non-prerelease-tags-only)
- [CLI Usage](#cli-usage)
  - [First Release](#first-release)
  - [Cutting Releases](#cutting-releases)
  - [Release as a Pre-Release](#release-as-a-pre-release)
  - [Release as a Target Type Imperatively (`npm version`-like)](#release-as-a-target-type-imperatively-npm-version-like)
  - [Prevent Git Hooks](#prevent-git-hooks)
  - [Signing Commits and Tags](#signing-commits-and-tags)
  - [Lifecycle Scripts](#lifecycle-scripts)
  - [Skipping Lifecycle Steps](#skipping-lifecycle-steps)
  - [Committing Generated Artifacts in the Release Commit](#committing-generated-artifacts-in-the-release-commit)
  - [Dry Run Mode](#dry-run-mode)
  - [Prefix Tags](#prefix-tags)
  - [Regenerate whole changelog from the first version](#regenerate-whole-changelog-from-the-first-version)
  - [CLI Help](#cli-help)
- [Code Usage](#code-usage)
- [FAQ](#faq)
  - [How is `standard-version` different from `semantic-release`?](#how-is-standard-version-different-from-semantic-release)
  - [Should I always squash commits when merging PRs?](#should-i-always-squash-commits-when-merging-prs)
  - [Can I use `standard-version` for additional metadata files, languages or version files?](#can-i-use-standard-version-for-additional-metadata-files-languages-or-version-files)
    - [Custom `updater`s](#custom-updaters)
      - [`readVersion(contents = string): string`](#readversioncontents--string-string)
      - [`writeVersion(contents = string, version: string): string`](#writeversioncontents--string-version-string-string)
- [Acknowledgement](#acknowledgement)
- [License](#license)

<!-- tocstop -->

## How It Works

1. Follow the [Conventional Commits Specification](https://conventionalcommits.org) in your repository.
2. When you're ready to release, run `standard-version`.

`standard-version` will then do the following:

1. Retrieve the current version of your repository by looking at `packageFiles`[[1]](#bumpfiles-packagefiles-and-updaters), falling back to the last `git tag`.
2. `bump` the version in `bumpFiles`[[1]](#bumpfiles-packagefiles-and-updaters) based on your commits.
3. Generates a `changelog` based on your commits (uses [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog) under the hood).
4. Creates a new `commit` including your `bumpFiles`[[1]](#bumpfiles-packagefiles-and-updaters) and updated CHANGELOG.
5. Creates a new `tag` with the new version number.

### `bumpFiles`, `packageFiles` and `updaters`

`standard-version` uses a few key concepts for handling version bumping in your project.

- **`packageFiles`** – User-defined files where versions can be read from _and_ be "bumped".
  - Examples: `package.json`, `manifest.json`
  - In most cases (including the default), `packageFiles` are a subset of `bumpFiles`.
- **`bumpFiles`** – User-defined files where versions should be "bumped", but not explicitly read from.
  - Examples: `package-lock.json`, `npm-shrinkwrap.json`
- **`updaters`** – Simple modules used for reading `packageFiles` and writing to `bumpFiles`.

By default, `standard-version` assumes you're working in a NodeJS based project... because of this, for the majority of projects you might never need to interact with these options.

That said, if you find your self asking [How can I use standard-version for additional metadata files, languages or version files?](#can-i-use-standard-version-for-additional-metadata-files-languages-or-version-files) – these configuration options will help!

## Installing `standard-version`

### As a local `npm run` script

Install and add to `devDependencies`:

```sh
npm i --save-dev standard-version
```

Add an [`npm run` script](https://docs.npmjs.com/cli/run-script) to your `package.json`:

```json
{
  "scripts": {
    "release": "standard-version"
  }
}
```

Now you can use `npm run release` in place of `npm version`.

This has the benefit of making your repo/package more portable, so that other developers can cut releases without having to globally install `standard-version` on their machine.

### As global `bin`

Install globally (add to your `PATH`):

```
npm i -g standard-version
```

Now you can use `standard-version` in place of `npm version`.

This has the benefit of allowing you to use `standard-version` on any repo/package without adding a dev dependency to each one.

### Using `npx`

As of `npm@5.2.0`, `npx` is installed alongside `npm`. Using `npx` you can use `standard-version` without having to keep a `package.json` file by running: `npx standard-version`.

This method is especially useful when using `standard-version` in non-JavaScript projects.

## Configuration

You can configure `standard-version` either by:

1. Placing a `standard-version` `configs` field in your `package.json` (assuming
   your project is JavaScript).
2. Creating a `.versionrc`, `.versionrc.json` or `.versionrc.js`.

- If you are using a `.versionrc.js` your default export must be a configuration object, or a function returning a configuration object.

Any of the command line parameters accepted by `standard-version` can instead
be provided via configuration. Please refer to the [conventional-changelog-config-spec](https://github.com/conventional-changelog/conventional-changelog-config-spec/) for details on available configuration options.

### Customizing CHANGELOG Generation

By default (as of `6.0.0`), `standard-version` uses the [conventionalcommits preset](https://github.com/conventional-changelog/conventional-changelog/tree/main/packages/conventional-changelog-conventionalcommits).

This preset:

- Adheres closely to the [conventionalcommits.org](https://www.conventionalcommits.org)
  specification.
- Is highly configurable, following the configuration specification
  [maintained here](https://github.com/conventional-changelog/conventional-changelog-config-spec).
  - _We've documented these config settings as a recommendation to other tooling makers._

There are a variety of dials and knobs you can turn related to CHANGELOG generation.

As an example, suppose you're using GitLab, rather than GitHub, you might modify the following variables:

- `commitUrlFormat`: the URL format of commit SHAs detected in commit messages.
- `compareUrlFormat`: the URL format used to compare two tags.
- `issueUrlFormat`: the URL format used to link to issues.

Making these URLs match GitLab's format, rather than GitHub's.

#### Compact changelog by non-prerelease tags only

Convetional Changelog by default will generate a CHANGELOG entry for each tag, but sometimes this can become messy if you do a lot of pre-releases (eg: v1.0.0-132). If you want the each entry to just list the changes between each non-prerelease version use the `--changelogIncludesPrereleases` flag

## CLI Usage

> **NOTE:** To pass nested configurations to the CLI without defining them in the `package.json` use dot notation as the parameters `e.g. --skip.changelog`.

### First Release

To generate your changelog for your first release, simply do:

```sh
# npm run script
npm run release -- --first-release
# global bin
standard-version --first-release
# npx
npx standard-version --first-release
```

This will tag a release **without bumping the version `bumpFiles`[1]()**.

When you are ready, push the git tag and `npm publish` your first release. \o/

### Cutting Releases

If you typically use `npm version` to cut a new release, do this instead:

```sh
# npm run script
npm run release
# or global bin
standard-version
```

As long as your git commit messages are conventional and accurate, you no longer need to specify the semver type - and you get CHANGELOG generation for free! \o/

After you cut a release, you can push the new git tag and `npm publish` (or `npm publish --tag next`) when you're ready.

### Release as a Pre-Release

Use the flag `--prerelease` to generate pre-releases:

Suppose the last version of your code is `1.0.0`, and your code to be committed has patched changes. Run:

```bash
# npm run script
npm run release -- --prerelease
```

This will tag your version as: `1.0.1-0`.

If you want to name the pre-release, you specify the name via `--prerelease <name>`.

For example, suppose your pre-release should contain the `alpha` prefix:

```bash
# npm run script
npm run release -- --prerelease alpha
```

This will tag the version as: `1.0.1-alpha.0`

### Release as a Target Type Imperatively (`npm version`-like)

To forgo the automated version bump use `--release-as` with the argument `major`, `minor` or `patch`.

Suppose the last version of your code is `1.0.0`, you've only landed `fix:` commits, but
you would like your next release to be a `minor`. Simply run the following:

```bash
# npm run script
npm run release -- --release-as minor
# Or
npm run release -- --release-as 1.1.0
```

You will get version `1.1.0` rather than what would be the auto-generated version `1.0.1`.

> **NOTE:** you can combine `--release-as` and `--prerelease` to generate a release. This is useful when publishing experimental feature(s).

### Prevent Git Hooks

If you use git hooks, like pre-commit, to test your code before committing, you can prevent hooks from being verified during the commit step by passing the `--no-verify` option:

```sh
# npm run script
npm run release -- --no-verify
# or global bin
standard-version --no-verify
```

### Signing Commits and Tags

If you have your GPG key set up, add the `--sign` or `-s` flag to your `standard-version` command.

### Lifecycle Scripts

`standard-version` supports lifecycle scripts. These allow you to execute your
own supplementary commands during the release. The following
hooks are available and execute in the order documented:

- `prerelease`: executed before anything happens. If the `prerelease` script returns a
  non-zero exit code, versioning will be aborted, but it has no other effect on the
  process.
- `prebump`/`postbump`: executed before and after the version is bumped. If the `prebump`
  script returns a version #, it will be used rather than
  the version calculated by `standard-version`.
- `prechangelog`/`postchangelog`: executes before and after the CHANGELOG is generated.
- `precommit`/`postcommit`: called before and after the commit step.
- `pretag`/`posttag`: called before and after the tagging step.

Simply add the following to your package.json to configure lifecycle scripts:

```json
{
  "standard-version": {
    "scripts": {
      "prebump": "echo 9.9.9"
    }
  }
}
```

As an example to change from using GitHub to track your items to using your projects Jira use a
`postchangelog` script to replace the url fragment containing 'https://github.com/`myproject`/issues/'
with a link to your Jira - assuming you have already installed [replace](https://www.npmjs.com/package/replace)

```json
{
  "standard-version": {
    "scripts": {
      "postchangelog": "replace 'https://github.com/myproject/issues/' 'https://myjira/browse/' CHANGELOG.md"
    }
  }
}
```

### Skipping Lifecycle Steps

You can skip any of the lifecycle steps (`bump`, `changelog`, `commit`, `tag`),
by adding the following to your package.json:

```json
{
  "standard-version": {
    "skip": {
      "changelog": true
    }
  }
}
```

### Committing Generated Artifacts in the Release Commit

If you want to commit generated artifacts in the release commit, you can use the `--commit-all` or `-a` flag. You will need to stage the artifacts you want to commit, so your `release` command could look like this:

```json
{
  "standard-version": {
    "scripts": {
      "prerelease": "webpack -p --bail && git add <file(s) to commit>"
    }
  }
}
```

```json
{
  "scripts": {
    "release": "standard-version -a"
  }
}
```

### Dry Run Mode

running `standard-version` with the flag `--dry-run` allows you to see what
commands would be run, without committing to git or updating files.

```sh
# npm run script
npm run release -- --dry-run
# or global bin
standard-version --dry-run
```

### Prefix Tags

Tags are prefixed with `v` by default. If you would like to prefix your tags with something else, you can do so with the `-t` flag.

```sh
standard-version -t @scope/package\@
```

This will prefix your tags to look something like `@scope/package@2.0.0`

If you do not want to have any tag prefix you can use the `-t` flag and provide it with an **empty string** as value.

> Note: simply -t or --tag-prefix without any value will fallback to the default 'v'

### Regenerate whole changelog from the first version

When you start using standard-version on an existing repositories you may have a changelog in a different format, or have none, and you may want to create one with all the entries for the existing version.

```sh
standard-version --regenerateChangelog
```

### CLI Help

```sh
# npm run script
npm run release -- --help
# or global bin
standard-version --help
```

## Code Usage

```js
const standardVersion = require('standard-version');

// Options are the same as command line, except camelCase
// standardVersion returns a Promise
standardVersion({
  noVerify: true,
  infile: 'docs/CHANGELOG.md',
  silent: true,
})
  .then(
    ({
      changelog, // generated changelog
      version, // new generated version tag
      commit, // commit message
    }) => {
      // standard-version is done
    }
  )
  .catch((err) => {
    console.error(`standard-version failed with message: ${err.message}`);
  });
```

_TIP: Use the `silent` option to prevent `standard-version` from printing to the `console`._

## FAQ

### How is `standard-version` different from `semantic-release`?

[`semantic-release`](https://github.com/semantic-release/semantic-release) is described as:

> semantic-release automates the whole package release workflow including: determining the next version number, generating the release notes and publishing the package.

While both are based on the same foundation of structured commit messages, `standard-version` takes a different approach by handling versioning, changelog generation, and git tagging for you **without** automatic pushing (to GitHub) or publishing (to an npm registry). Use of `standard-version` only affects your local git repo - it doesn't affect remote resources at all. After you run `standard-version`, you can review your release state, correct mistakes and follow the release strategy that makes the most sense for your codebase.

We think they are both fantastic tools, and we encourage folks to use `semantic-release` instead of `standard-version` if it makes sense for their use-case.

### Should I always squash commits when merging PRs?

The instructions to squash commits when merging pull requests assumes that **one PR equals, at most, one feature or fix**.

If you have multiple features or fixes landing in a single PR and each commit uses a structured message, then you can do a standard merge when accepting the PR. This will preserve the commit history from your branch after the merge.

Although this will allow each commit to be included as separate entries in your CHANGELOG, the entries will **not** be able to reference the PR that pulled the changes in because the preserved commit messages do not include the PR number.

For this reason, we recommend keeping the scope of each PR to one general feature or fix. In practice, this allows you to use unstructured commit messages when committing each little change and then squash them into a single commit with a structured message (referencing the PR number) once they have been reviewed and accepted.

### Can I use `standard-version` for additional metadata files, languages or version files?

As of version `7.1.0` you can configure multiple `bumpFiles` and `packageFiles`.

1. Specify a custom `bumpFile` "`filename`", this is the path to the file you want to "bump"
2. Specify the `bumpFile` "`updater`", this is _how_ the file will be bumped.
   a. If you're using a common type, you can use one of `standard-version`'s built-in `updaters` by specifying a `type`.
   b. If your using an less-common version file, you can create your own `updater`.

```js
// .versionrc
{
  "bumpFiles": [
    {
      "filename": "MY_VERSION_TRACKER.txt",
      // The `plain-text` updater assumes the file contents represents the version.
      "type": "plain-text"
    },
    {
      "filename": "a/deep/package/dot/json/file/package.json",
      // The `json` updater assumes the version is available under a `version` key in the provided JSON document.
      "type": "json"
    },
    {
      "filename": "VERSION_TRACKER.json",
      //  See "Custom `updater`s" for more details.
      "updater": "standard-version-updater.js"
    }
  ]
}
```

If using `.versionrc.js` as your configuration file, the `updater` may also be set as an object, rather than a path:

```js
// .versionrc.js
const tracker = {
  filename: 'VERSION_TRACKER.json',
  updater: require('./path/to/custom-version-updater'),
};

module.exports = {
  bumpFiles: [tracker],
  packageFiles: [tracker],
};
```

#### Custom `updater`s

An `updater` is expected to be a Javascript module with _atleast_ two methods exposed: `readVersion` and `writeVersion`.

##### `readVersion(contents = string): string`

This method is used to read the version from the provided file contents.

The return value is expected to be a semantic version string.

##### `writeVersion(contents = string, version: string): string`

This method is used to write the version to the provided contents.

The return value will be written directly (overwrite) to the provided file.

---

Let's assume our `VERSION_TRACKER.json` has the following contents:

```json
{
  "tracker": {
    "package": {
      "version": "1.0.0"
    }
  }
}
```

An acceptable `standard-version-updater.js` would be:

```js
// standard-version-updater.js
const stringifyPackage = require('stringify-package');
const detectIndent = require('detect-indent');
const detectNewline = require('detect-newline');

module.exports.readVersion = function (contents) {
  return JSON.parse(contents).tracker.package.version;
};

module.exports.writeVersion = function (contents, version) {
  const json = JSON.parse(contents);
  let indent = detectIndent(contents).indent;
  let newline = detectNewline(contents);
  json.tracker.package.version = version;
  return stringifyPackage(json, indent, newline);
};
```

## Acknowledgement

This package is a fork of the original work of [bcoe](https://github.com/bcoe) on [standard-version](https://github.com/conventional-changelog/standard-version#readme). This projects aim to maintain the existing APIs while adding some minor enhancements and new Node.js version supports.

We're moving forward from original latest version `9.5.0` to avoid conflicts, everything before `v10.0.0` can be found on the original repository.

## License

ISC

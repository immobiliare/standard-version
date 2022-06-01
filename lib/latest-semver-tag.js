const gitSemverTags = require('git-semver-tags');
const semver = require('semver');

function clearTag(tag, tagPrefix) {
  const REX = new RegExp('^' + tagPrefix);
  return semver.clean(tag.replace(REX, ''));
}

function clearTags(tags = [], tagPrefix) {
  return tags.map((t) => clearTag(t, tagPrefix));
}

function latestSemverTag(n = 1, opts) {
  if (typeof n === 'object') opts = n;

  const { tagPrefix, changelogIncludesPrereleases, withPrefix } = Object.assign(
    {
      tagPrefix: undefined,
      changelogIncludesPrereleases: true,
      withPrefix: false,
    },
    opts
  );

  return new Promise((resolve, reject) => {
    gitSemverTags({ tagPrefix }, function (err, tags) {
      if (err) {
        return reject(err);
      } else if (!tags.length) {
        tags = tagPrefix ? [tagPrefix + '1.0.0'] : ['1.0.0'];
      }

      if (typeof n !== 'number' || n <= 0) n = tags.length;

      // follow me on this because it ugly
      return resolve(
        tags
          .filter((tag) => {
            if (changelogIncludesPrereleases) return true;
            // if returns null its not a prerelease
            return semver.prerelease(tag) === null;
          })
          // we need to replace any custom tags prefix
          .map((tag) => {
            // [original, cleaned for sorting]
            return {
              raw: tag,
              clean: clearTag(tag, tagPrefix),
            };
          })
          // so we can sort them cronologically following semver
          .sort((a, b) => semver.rcompare(a.clean, b.clean))
          // then re-add prefix so we can use tags for git commands or they 404
          .map(({ clean, raw }) => (withPrefix ? raw : clean))
          .slice(0, n)
      );
    });
  });
}

exports.latestSemverTag = latestSemverTag;
exports.clearTag = clearTag;
exports.clearTags = clearTags;

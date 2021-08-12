import parseVersionString from 'common/parseVersionString';
import Config from 'parser/Config';

import VERSIONS from './VERSIONS';

export default function isLatestPatch(config: Config) {
  if (!config.patchCompatibility) {
    return false;
  }

  const specPatchCompatibility = parseVersionString(config.patchCompatibility);
  const gameVersion = VERSIONS[config.expansion];
  if (!gameVersion) {
    return false;
  }

  const latestPatch = parseVersionString(gameVersion);

  const isOutdated =
    specPatchCompatibility.major < latestPatch.major ||
    specPatchCompatibility.minor < latestPatch.minor ||
    specPatchCompatibility.patch < latestPatch.patch;

  return !isOutdated;
}

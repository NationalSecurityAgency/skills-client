var semver = require('semver');

export default {
    versionLaterThan (lib, minVersion){
        const versionToCompare = Cypress.env(lib);
        if (!versionToCompare) {
            return true;
        }
        const shouldSkip = semver.lt(versionToCompare, minVersion);
        return !shouldSkip;
    }
}

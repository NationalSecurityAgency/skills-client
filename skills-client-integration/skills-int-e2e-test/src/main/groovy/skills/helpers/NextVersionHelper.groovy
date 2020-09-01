package skills.helpers

import com.vdurmont.semver4j.Semver

class NextVersionHelper {
    ScriptParamsHelper.ReleaseMode releaseMode

    String getNextVersion(String currentVersion) {
        Semver semver = new Semver(currentVersion)
        String newVersion
        switch (releaseMode) {
            case ScriptParamsHelper.ReleaseMode.Major:
                newVersion = semver.nextMajor().value
                break;
            case ScriptParamsHelper.ReleaseMode.Minor:
                newVersion = semver.nextMinor().value
                break;
            case ScriptParamsHelper.ReleaseMode.Patch:
                newVersion = semver.nextPatch().value
                break;
            default:
                throw new IllegalArgumentException("Unknown release type")
        }
        newVersion
    }
}

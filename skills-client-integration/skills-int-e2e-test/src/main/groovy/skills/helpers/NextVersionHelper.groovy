/*
Copyright 2025 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package skills.helpers

import com.vdurmont.semver4j.Semver
import groovy.transform.Sortable
import org.apache.commons.lang3.StringUtils

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

    // returns on the most recent patch version for each unique major.minor version and exclude and version < minVersion
    List<File> getVersionsToTest(String minVersion, List<File> jarFiles) {
        Semver minVersionToTest = new Semver(minVersion)
        List<File> versionsToTest = []
        List<FileWithVersion> filesWithVersion = []
        jarFiles.each { jarFile ->
            String version = StringUtils.substringBeforeLast(StringUtils.substringAfterLast(jarFile.name, '-'), '.')
            if (new Semver(version).isGreaterThanOrEqualTo(minVersionToTest)) {
                filesWithVersion.add(new FileWithVersion(file: jarFile, version: new Semver(version)))
            }
        }

        if (filesWithVersion) {
            filesWithVersion = filesWithVersion.toSorted()
            FileWithVersion last
            filesWithVersion.each {
                if (last != null && (it.version.major != last.version.major || it.version.minor != last.version.minor)) {
                    versionsToTest.add(last.file)
                }
                last = it
            }
            versionsToTest.add(last.file)
        }
        return versionsToTest
    }

    @Sortable(excludes = ['file'])
    static class FileWithVersion {
        Semver version
        File file
    }
}

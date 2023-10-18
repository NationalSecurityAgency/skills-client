/*
Copyright 2020 SkillTree

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
package skills

import groovy.json.JsonSlurper
import groovy.transform.ToString
import groovy.util.logging.Slf4j
import skills.helpers.Vars

@ToString(includeNames = true, excludes = "packageJson")
@Slf4j
class NpmProj {
    // indicates a client lib that we need to link to
    boolean doOthersLinkToMe
    String name
    File loc
    // indicates whether it has node_modules/@skilltree/
    boolean hasLinksToOtherProjects = true

    // for backwards compatibility testing
    String initialVersion

    ProcessRunner.ProcessRes exec(String command, boolean dryRun = false, File loc = this.loc) {
        if (!dryRun) {
            log.info("${loc.name} command: ${command}")
        }
        ProcessRunner.ProcessRes processRes = new ProcessRunner(loc: loc, dryRun: dryRun, failWithErrMsg: false).run(command)
        return processRes
    }

    File getNodeModulesDir(boolean checkForExistence = true) {
        File modules = new File(loc, "node_modules/")
        if (checkForExistence) {
            assert modules.exists()
        }
        return modules
    }

    File getSkillsModulesDir(boolean checkForExistence = true) {
        File skillsModules = new File(getNodeModulesDir(checkForExistence), "@skilltree/")
        if (checkForExistence) {
            assert skillsModules.exists()
        }
        return skillsModules
    }

    static JsonSlurper slurper = new JsonSlurper()

    def getPackageJson() {
        slurper.parse(new File(loc, "package.json"))
    }

    List<String> getSkillsDependenciesFromPackageJson() {
        return packageJson.dependencies.findAll {
            it.key.toString().startsWith(Vars.NpmNamespace)
        }.collect { it.key }
    }

    String getVersion() {
        return packageJson.version
    }

    String getDepVersion(String dep) {
        return packageJson.dependencies."$dep"
    }

}

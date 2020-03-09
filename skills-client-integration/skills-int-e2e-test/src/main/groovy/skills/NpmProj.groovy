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

@ToString(includeNames = true, excludes = "packageJson")
@Slf4j
class NpmProj {
    // indicates a client lib that we need to link to
    boolean doOthersLinkToMe
    String name
    File loc
    // indicates whether it has node_modules/@skills/
    boolean hasLinksToOtherProjects = true

    // need extra npm link setup for react apps/modules
    boolean reactModule = false
    boolean reactApp = false

    ProcessRunner.ProcessRes exec(String command, boolean dryRun = false) {
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
        File skillsModules = new File(getNodeModulesDir(checkForExistence), "@skills/")
        if (checkForExistence) {
            assert skillsModules.exists()
        }
        return skillsModules
    }

    File getReactModuleDir(boolean checkForExistence = true) {
        File reactModule = new File(getNodeModulesDir(checkForExistence), "react/")
        if (checkForExistence) {
            assert reactModule.exists()
        }
        return reactModule
    }

    static JsonSlurper slurper = new JsonSlurper()

    def getPackageJson() {
        slurper.parse(new File(loc, "package.json"))
    }

    String getVersion() {
        return packageJson.version
    }

    String getDepVersion(String dep) {
        return packageJson.dependencies."$dep"
    }

    void gitPullRebase(boolean dryRun = false) {
        new ProcessRunner(loc: loc, dryRun: dryRun).run("git pull --rebase")
    }

    boolean hasUnreleasedChanges() {
        ProcessRunner.ProcessRes processRes = new ProcessRunner(loc: loc, printOutput: false).run("git diff ${version}".toString())
        if (processRes.sout) {
            return true
        }
        return false
    }
}
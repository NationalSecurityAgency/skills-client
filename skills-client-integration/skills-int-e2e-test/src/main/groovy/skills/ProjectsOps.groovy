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

//import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class ProjectsOps {

    File workDir

    // private
    TitlePrinter titlePrinter = new TitlePrinter()
    private List<NpmProj> allProjCached

    List<NpmProj> getAllProj() {
        if (!allProjCached) {
            allProjCached = new NpmProjBuilder(loc: skillsClient).build()
        }
        return allProjCached
    }

    File getSkillsClient(){
        new File(workDir, "skills-client")
    }

//    @Profile
    private void clearWorkDir() {
        log.info("releaseDir is [${workDir.absolutePath}]")
        if (workDir.exists()) {
            FileUtils.deleteDirectory(workDir)
            log.info("removed previous release dir [{}]", workDir.absolutePath)
        }

        assert !workDir.exists()
        workDir.mkdirs()
    }

//    @Profile
    void checkoutLinkedNpmLibs(String switchToBranch = null) {
        clearWorkDir()
        titlePrinter.printTitle("Checkout skills-client")

        new ProcessRunner(loc: workDir).run("git clone git@github.com:NationalSecurityAgency/skills-client.git")
        if (switchToBranch && switchToBranch != "master") {
            new ProcessRunner(loc: workDir).run("git checkout ${switchToBranch}")
        }
    }

    boolean hasUnreleasedChanges(){
        // TODO: check specific projects using 'git diff'
        return true
    }

}

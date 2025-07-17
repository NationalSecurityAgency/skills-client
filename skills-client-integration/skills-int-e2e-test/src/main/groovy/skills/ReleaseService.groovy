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
package skills

import groovy.util.logging.Slf4j
import groovy.xml.XmlSlurper
import skills.helpers.NextVersionHelper
import skills.helpers.ScriptParamsHelper

@Slf4j
class ReleaseService {

    static void main(String[] args) {
        if (!args){
            println "Usage with Dry Run: -releaseMode=Major|Minor|Patch -proj=CallStackProf|SkillsService -workDir=/path/to/work/dir"
            println "Usage: -releaseMode=Major|Minor|Patch -proj=CallStackProf|SkillsService -workDir=/path/to/work/dir -notDryRun"
            System.exit(-1)
        }
        ScriptParamsHelper scriptParamsHelper = new ScriptParamsHelper(args: args)
        File workDir = scriptParamsHelper.getWorkingDir()
        ScriptParamsHelper.ReleaseMode releaseMode = scriptParamsHelper.getReleaseMode()
        Boolean notDryRun = scriptParamsHelper.getNotDryRun()

        String projNameStr = args.find({ it.startsWith("-proj=") })
        assert projNameStr, "Must provide -proj=${SupportedProject.values().collect { it.name() }.join("|")}"
        SupportedProject proj = SupportedProject.valueOf(projNameStr.split("-proj=")[1])

        String patchBranch = "master"
        if (releaseMode == ScriptParamsHelper.ReleaseMode.Patch){
            patchBranch = scriptParamsHelper.getPatchBranch()
        }
        boolean runLocalButNoPushToRemote = scriptParamsHelper.getRunLocalButNoPushToRemove()
        String optionalSubProject = proj == SupportedProject.SkillsService ? "service" : null
        new ReleaseService(workDir: workDir, releaseMode: releaseMode,
                dryRun: !notDryRun, proj: proj, baseBranch: patchBranch,
                optionalSubProject: optionalSubProject,
                onlyLocalButRemoteDryRun: runLocalButNoPushToRemote).release()
    }

    ScriptParamsHelper.ReleaseMode releaseMode
    String baseBranch = "master"
    boolean dryRun = true
    File workDir
    SupportedProject proj
    String optionalSubProject
    boolean onlyLocalButRemoteDryRun

    enum SupportedProject {
        SkillsService("skills-service"), CallStackProf ("call-stack-profiler");

        String name

        SupportedProject(String name) {
            this.name = name;
        }
    }
    // private
    TitlePrinter titlePrinter = new TitlePrinter()

    void release() {
        String projName = proj.name
        titlePrinter.printTitle("Let's release. Project=[${projName}], Release Mode=[${releaseMode}], Dry Run=[${dryRun}], Work Dir=[${workDir.absolutePath}]")
        log.info("Project name [${projName}]")

        new ProcessRunner(loc: workDir).run("git clone git@github.com:NationalSecurityAgency/${projName}.git")
        File projRootDir = new File(workDir, projName)
        assert projRootDir.exists()
        // if patch then move to its the branch
        if (releaseMode == ScriptParamsHelper.ReleaseMode.Patch) {
            new ProcessRunner(loc: projRootDir).run("git checkout ${baseBranch}")
        }

        titlePrinter.printSubTitle("Start: Validation Phase")
        String releaseVersion = getReleaseVersion(projRootDir)
        validateNoTag(projRootDir, releaseVersion)

        // if major or minor version then create a branch, so it's ready for future patches
        boolean createBranch = [ScriptParamsHelper.ReleaseMode.Major, ScriptParamsHelper.ReleaseMode.Minor].contains(releaseMode)
        String branchName = releaseVersion.split("\\.").toList().subList(0, 2).join(".") + ".X"
        if (createBranch) {
            validateNoBranch(projRootDir, branchName)
        }
        titlePrinter.printSubTitle("Done: Validation Phase")

        String nextSnapshotVersion = new NextVersionHelper(releaseMode: releaseMode).getNextVersion(releaseVersion) + "-SNAPSHOT"

        log.info("Base branch name: [{}]", baseBranch)
        log.info("Next snapshot version: [{}]", nextSnapshotVersion)

        def findJar = { List<File> jars ->
            if(!jars || jars.size() == 0) {
                return null
            } else if (jars.size() > 1){
                return jars.find { it.name.startsWith(projName) }
            } else {
                return jars.first()
            }
        }

        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("mvn versions:set -DnewVersion=${releaseVersion} -DgenerateBackupPoms=false")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git commit -a -m creating_release_version_${releaseVersion}")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git tag -a ${releaseVersion} -m tag_release_version_${releaseVersion}")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push origin ${releaseVersion}")

        if (createBranch) {
            titlePrinter.printSubTitle("Creating branch [${branchName}] for future patch work")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git checkout -b ${branchName}")

            String branchSnapshot = new NextVersionHelper(releaseMode: ScriptParamsHelper.ReleaseMode.Patch).getNextVersion(releaseVersion) + "-SNAPSHOT"
            new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("mvn versions:set -DnewVersion=${branchSnapshot} -DgenerateBackupPoms=false")

            new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git commit -a -m creating_patch_branch_[${branchSnapshot}]")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push -u origin ${branchName}")


            titlePrinter.printSubTitle("Reset our base branch [${baseBranch}] for the next version")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git checkout ${baseBranch}")
        }

        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("mvn versions:set -DnewVersion=${nextSnapshotVersion} -DgenerateBackupPoms=false")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git commit -a -m prep_master_for_the_next_dev_version_[${nextSnapshotVersion}]")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push")

        titlePrinter.printSubTitle("Start: Prepare To Release Artifacts")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("git checkout ${releaseVersion}")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun && !onlyLocalButRemoteDryRun).run("mvn --batch-mode package -DskipTests")
        File jar
        if (optionalSubProject) {
            jar = new File(projRootDir, "${optionalSubProject}/target").listFiles().find { it.name.startsWith(projName) && it.name.endsWith(".jar") }
        } else {
            List<File> jars = new File(projRootDir, "target").listFiles().findAll { it.name.endsWith(".jar") }
            jar = findJar(jars)
        }
        if (!dryRun || onlyLocalButRemoteDryRun) {
            assert jar
            log.info("Jar is ready to be published: [${jar.absolutePath}]")
        }
        titlePrinter.printSubTitle("Done: Prepare To Release Artifacts")

        titlePrinter.printTitle('ALL DONE')
    }


    private void validateNoTag(File projRootDir, String tag) {
        String res = new ProcessRunner(loc: projRootDir, printOutput: false).run("git tag").sout
        assert !res.split("\n").find({ it.equalsIgnoreCase(tag) }), "There is already ${tag} tag"
    }

    private void validateNoBranch(File projRootDir, String branch) {
        String res = new ProcessRunner(loc: projRootDir, printOutput: false).run("git branch -a").sout
        assert !res.split("\n").find({ it.contains(branch) }), "There is already ${branch} branch"
    }


    private String getReleaseVersion(File skillsService) {
        File pom = new File(skillsService, "pom.xml")
        def slurpedPom = new XmlSlurper().parse(pom)
        String version = slurpedPom.version
        log.info("Current version is [{}]", version)
        assert version.endsWith("SNAPSHOT")
        String newVersion = version.split("-SNAPSHOT")[0]
        log.info("Release version is [{}]", newVersion)
        return newVersion
    }
}

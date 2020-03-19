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

import com.vdurmont.semver4j.Semver
import groovy.json.JsonOutput
import groovy.util.logging.Slf4j
import org.apache.commons.lang3.StringUtils

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        String releaseTypeParam = args.find({ it.startsWith("-releaseType=") })
        assert releaseTypeParam, "Must provide releaseType=${ReleaseType.values().collect({ it.name() }).join("|")}"
        String releaseTypeStr = releaseTypeParam.split("-releaseType=")[1]
        assert ReleaseType.values().find({ it.name() == releaseTypeStr }), "Must provide -releaseType=${ReleaseType.values().collect({ it.name() }).join("|")}"
        ReleaseType releaseType = ReleaseType.valueOf(releaseTypeStr)
        Boolean notDryRun = args.find({ it.equalsIgnoreCase("-notDryRun") })

        String patchBranch = "master"
        // not doing branching in this script, for now?
//        if (releaseType == ReleaseType.patch){
//            String param = "-patchBranch="
//            String patchBranchParam = args.find({ it.startsWith(param) })
//            assert patchBranchParam, "Must provide ${param} param when using -releaseType=patch"
//            patchBranch = patchBranchParam.split(param)[1]
//        }


        new ReleaseClientLibs(releaseType: releaseType, dryRun: !notDryRun, baseBranch: patchBranch).release()
    }

    enum ReleaseType { patch, minor, major }
    ReleaseType releaseType
    File workDir = new File("./skills-client-integration/skills-int-e2e-test/target/${ReleaseClientLibs.simpleName}/")
    TitlePrinter titlePrinter = new TitlePrinter()
    boolean dryRun = true
    String baseBranch = "master"

    void release(){
        titlePrinter.printTitle("Release Client Libs: Release type=[${releaseType}]")
        DirHelper.createEmptyDirClearIfExist(workDir)

        ProjectsOps npmProjects = new ProjectsOps(workDir: workDir)
        npmProjects.checkoutLinkedNpmLibs(baseBranch)

        List<NpmProjRel> rels = new NpmProjBuilder(loc: workDir).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }

        boolean needToRelease = npmProjects.hasUnreleasedChanges()
        if (!needToRelease) {
            log.info("DONE! There are no changes to release!")
            return
        }


        List<NpmProj> projsToRelease = npmProjects.allProj.findAll({ it.doOthersLinkToMe })
        String currentVersion = projsToRelease.first().packageJson.version
        String newVersion = getNextVersion(currentVersion)
        log.info("Going from version [${currentVersion}] to [${newVersion}]")

        for (NpmProj proj in npmProjects.allProj) {
            updateVersion(proj, newVersion)
        }
        new ProcessRunner(loc: new File(npmProjects.skillsClient, "skills-client-integration"), dryRun: false).run("mvn versions:set -DnewVersion=${newVersion}-SNAPSHOT -DgenerateBackupPoms=false")

        for (NpmProj proj in projsToRelease) {
            titlePrinter.printTitle("Release for [${proj.name}], version [${newVersion}]")
            proj.exec("npm prune", dryRun)
            proj.exec("npm install", dryRun)
            proj.exec("npm run build", dryRun)
            proj.exec("npm publish", dryRun)

            List<NpmProjRel> updateVersion = rels.findAll({ it.to.name == proj.name })
            for (NpmProjRel updateRel in updateVersion) {
                String fromVersion = updateRel.from.getDepVersion("@skills/${updateRel.to.name}");
                if (!fromVersion.equalsIgnoreCase(updateRel.to.version)) {
                    log.info("  Update version for [${updateRel.from.name}]: ${updateRel.to.name} [${fromVersion}] -> [${newVersion}]")
                    updateRel.from.exec("npm install --save-exact @skills/${updateRel.to.name}@${newVersion}", dryRun)
                } else {
                    log.info("   [${updateRel.from.name}]: is already up-to-date with version ${updateRel.to.name}:${updateRel.to.version}")
                }
            }
        }

        titlePrinter.printSubTitle("Git tag [${newVersion}] and push")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git commit -a -m incrementing")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git tag -a ${newVersion} -m tag_release_version_${newVersion}")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git push")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git push origin ${newVersion}")

        titlePrinter.printTitle("ALL DONE!")
    }

    private void updateVersion(NpmProj npmProj, String newVersion) {
        assert npmProj
        assert StringUtils.isNoneBlank(newVersion)

        def json = npmProj.getPackageJson()
        json.version = newVersion
        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
        File f = new File(npmProj.loc, "package.json")
        assert f.exists()
        f.write(jsonToSave)

        // sanity check
        assert npmProj.version == newVersion
        log.info("Updated version [${npmProj.name}] = [${newVersion}]")
    }

    private String getNextVersion(String currentVersion) {
        Semver semver = new Semver(currentVersion)
        String newVersion
        switch (releaseType) {
            case ReleaseType.major:
                newVersion = semver.nextMajor().value
                break;
            case ReleaseType.minor:
                newVersion = semver.nextMinor().value
                break;
            case ReleaseType.patch:
                newVersion = semver.nextPatch().value
                break;
        }
        newVersion
    }
}

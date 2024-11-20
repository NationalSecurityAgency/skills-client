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


import groovy.json.JsonOutput
import groovy.util.logging.Slf4j
import skills.helpers.NextVersionHelper
import skills.helpers.ScriptParamsHelper
import skills.helpers.Vars

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        ScriptParamsHelper scriptParamsHelper = new ScriptParamsHelper(args: args)
        File workDir = scriptParamsHelper.getWorkingDir()
        ScriptParamsHelper.ReleaseMode releaseMode = scriptParamsHelper.getReleaseMode()
        Boolean notDryRun = scriptParamsHelper.getNotDryRun()
        new ReleaseClientLibs(releaseMode: releaseMode, dryRun: !notDryRun, baseBranch: "master", workDir:  workDir).release()
    }

    ScriptParamsHelper.ReleaseMode releaseMode
    File workDir = new File("./skills-client-integration/skills-int-e2e-test/target/${ReleaseClientLibs.simpleName}/")
    TitlePrinter titlePrinter = new TitlePrinter()
    boolean dryRun = true
    String baseBranch = "master"

    void release(){
        titlePrinter.printTitle("Release Client Libs: Release type=[${releaseMode}], Dry Run=[${dryRun}], Work Dir=[${workDir.absolutePath}]")
        ProjectsOps npmProjects = new ProjectsOps(workDir: workDir)
        new ProcessRunner(loc: workDir).run("git clone git@github.com:NationalSecurityAgency/skills-client.git")
        if (baseBranch && baseBranch != "master") {
            new ProcessRunner(loc: workDir).run("git checkout ${baseBranch}")
        }
        List<NpmProjRel> rels = new NpmProjBuilder(loc: workDir).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }

        List<NpmProj> projsToRelease = npmProjects.allProj.findAll({ it.doOthersLinkToMe })
        // validate that all versions are the same
        List<String> versions = projsToRelease.collect({it.version}).unique()
        assert versions.size() == 1, "All npm versions must be the same"

        String currentVersion = versions.first()
        String newVersion = new NextVersionHelper(releaseMode: releaseMode).getNextVersion(currentVersion)
        log.info("Going from version [${currentVersion}] to [${newVersion}]")

        for (NpmProj proj in npmProjects.allProj) {
            updateVersion(proj, newVersion)
        }
        new ProcessRunner(loc: new File(npmProjects.skillsClient, "skills-client-integration"), dryRun: false).run("mvn versions:set -DnewVersion=${newVersion}-SNAPSHOT -DgenerateBackupPoms=false")

        titlePrinter.printSubTitle("Git tag [${newVersion}] and push")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git commit -a -m creating_release_version_${newVersion}")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git tag -a ${newVersion} -m tag_release_version_${newVersion}")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git push")
        new ProcessRunner(loc: npmProjects.skillsClient, dryRun: dryRun).run("git push origin ${newVersion}")

        // Maybe one day add to automatically release, will need to 'npm login' first though
//        for (NpmProj proj in projsToRelease) {
//            titlePrinter.printTitle("Release for [${proj.name}], version [${newVersion}]")
//            proj.exec("npm install", dryRun)
//            proj.exec("npm run build", dryRun)
//            proj.exec("npm publish --access public", dryRun)
//        }

        titlePrinter.printTitle("ALL DONE!")
    }

    private void updateVersion(NpmProj npmProj, String newVersion) {
        assert npmProj
        assert newVersion && newVersion.length() > 0

        def json = npmProj.getPackageJson()
        json.version = newVersion
        json.dependencies.findAll { it.key.startsWith(Vars.NpmNamespace) }.each {
            json.dependencies."${it.key}" = newVersion
            log.info("Updated version [${npmProj.name}] devDependency => [${it.key}] = [${newVersion}]")
        }
        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
        File f = new File(npmProj.loc, "package.json")
        assert f.exists()
        f.write(jsonToSave)
        log.info("Updated version [${npmProj.name}] = [${newVersion}]")

        // sanity check
        assert npmProj.version == newVersion
        json.dependencies.findAll { it.key.startsWith(Vars.NpmNamespace) }.each {
            assert json.dependencies."${it.key}" == newVersion
        }
    }
}

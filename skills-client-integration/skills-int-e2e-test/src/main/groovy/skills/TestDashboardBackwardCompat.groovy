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

//import callStack.profiler.CProf
//import callStack.profiler.Profile
import groovy.json.JsonOutput
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import org.springframework.core.io.Resource
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.core.io.support.ResourcePatternResolver
import skills.backwardsCompat.BackwardCompatHelper
import skills.backwardsCompat.Dep
import skills.backwardsCompat.DepToTest
import skills.backwardsCompat.Deps
import skills.backwardsCompat.TestDeps
import skills.backwardsCompat.TestRun
import skills.backwardsCompat.VersionToTest

import java.util.concurrent.atomic.AtomicInteger

@Slf4j
class TestDashboardBackwardCompat {

    static void main(String[] args) {
//        if (!args){
//            println "FAILED! Missing param. Usage: TestDashboardBackwardCompat -backendVersion=<version>\n" +
//                    "  Example: TestDashboardBackwardCompat -backendVersion=1.1.2-SNAPSHOT"
//            System.exit(-1)
//        }

//        String backendVersionStr = args.find({ it.startsWith("-backendVersion=") })
//        assert backendVersionStr, "Must supply -backendVersion param"
//        String backendVersion = backendVersionStr.split("-backendVersion=")[1]
        new TestDashboardBackwardCompat().testNew()
    }

//    String backendVersion
    File workDir = new File("./target/skills-client")
    // private
    TitlePrinter titlePrinter = new TitlePrinter()

    List<String> versionsToExclude = ["2.0.0"]

    void checkoutWorkingCopy() {
        if (workDir.exists()) {
            FileUtils.deleteDirectory(workDir)
            log.info("Removed [$workDir]")
        }
        new ProcessRunner(loc: workDir.parentFile).run("git clone https://github.com/NationalSecurityAgency/skills-client.git")
    }

    private void copyServiceJar() {
        File serviceDir = new File(workDir, "skills-service")
        serviceDir.mkdir()
        File serviceJar = new File("./skills-service").listFiles().find({ it.name.startsWith("skills-service") && it.name.endsWith(".jar") })
        File dest = new File(serviceDir, serviceJar.name)
        FileUtils.copyFile(serviceJar, dest)
        assert dest.exists()
        log.info("Copied service jar to [$dest]")
    }

    void applyPatch(String version) {
        /**
         * To create patch file:
         * git add .
         * git diff --cached > X-X-X.patch
         */

        ClassLoader cl = this.getClass().getClassLoader()
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(cl)
        Resource[] resources = resolver.getResources("classpath*:/versionPatches/*")
        String patchFile = version.replace(".", "-") + ".patch"
        Resource found = resources.find { it.filename.endsWith(patchFile) }
        if (found) {
            FileUtils.copyToFile(found.inputStream, new File(workDir, patchFile))
        }
        new ProcessRunner(loc: workDir).run("git apply ${patchFile}")
    }

    void testNew() {
        checkoutWorkingCopy()
        File clientIntLoc = new File(workDir, "skills-client-integration")
        File e2eLoc = new File(clientIntLoc, "skills-int-e2e-test")

        String tagsStrs = new ProcessRunner(loc: new File("./")).run("git tag").sout
        List<String> versionsToTest = tagsStrs.split("\n").toList();
        versionsToTest.removeAll(versionsToExclude)
        log.info("Versions to test:\n  ${versionsToTest.join("\n  ")}")

        for (String version : versionsToTest) {
            titlePrinter.printTitle("Testing version [${version}]")

            new ProcessRunner(loc: workDir).run("git checkout ${version}")
            assert new ProcessRunner(loc: workDir).run("git status").sout.contains(version)
            applyPatch(version)
            copyServiceJar()

            List<NpmProj> allProjects = new NpmProjBuilder(loc: workDir).build()
            List<NpmProj> intProjs = allProjects.findAll({ it.hasLinksToOtherProjects && it.name.contains("-int-") })

            titlePrinter.printSubTitle("[${version}]: Update package.json and prune")
            intProjs.each { NpmProj intProj ->
                String lookForDep = intProj.name.replaceAll("-int", "")
                updatePackageJsonDeps(intProj, "@skilltree/$lookForDep", version)
                intProj.exec("npm prune")
            }

            titlePrinter.printSubTitle("[${version}]: Building Client Examples App")
            new ProcessRunner(loc: clientIntLoc).run("mvn --batch-mode clean package")

            titlePrinter.printSubTitle("[${version}]: Running cypress test with")
            String output = "Testing version [$version]"
            runCypressTests(e2eLoc, output, "!!!!FAILED!!!! while running with:\n${output}")
        }
    }

    private Object updatePackageJsonDeps(NpmProj packageToChange, String depName, String version) {
        assert packageToChange && depName && version
        def json = packageToChange.getPackageJson()
        json.dependencies."${depName}" = version
        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
        File f = new File(packageToChange.loc, "package.json")
        assert f.exists()
        f.write(jsonToSave)

        // sanity check
        assert packageToChange.packageJson.dependencies."${depName}" == version
    }

    private void runCypressTests(File e2eProj, String clientLibsMsg = " Latest using npm link", String errMessage = "!!!!FAILED!!!! while running latest code using 'npm link'", List<String> env = []) {
        try {
            doRunCypressTests(e2eProj, clientLibsMsg, env)
        } catch (Throwable t) {
            log.error(errMessage)
            throw t;
        }
    }

    private void doRunCypressTests(File e2eProj, String msg, List<String> cypressEnv = [], String npmIntegrationNamespace = "integration") {
        titlePrinter.printTitle("Running cypress tests: [${msg}]")
        new ProcessRunner(loc: e2eProj).run("npm install")
        new ProcessRunner(loc: e2eProj, failWithErrMsg: false).run("npm run cyServices:kill")
        try {
            new ProcessRunner(loc: e2eProj, waitForOutput: false).run("npm run cyServices:start:skills-service:ci")
            new ProcessRunner(loc: e2eProj, waitForOutput: false).run("npm run cyServices:start:integration-apps")

            titlePrinter.printSubTitle("Starting Cypress tests [${msg}]")

            String env = cypressEnv ? " --env ${cypressEnv.join(",")}" : ""
            new ProcessRunner(loc: e2eProj).run("npx cypress run${env}")
        } finally {
            new ProcessRunner(loc: e2eProj, failWithErrMsg: false).run("npm run cyServices:kill")
        }
    }


//    private List<TestRun> generateTestRuns(List<DepToTest> toTest) {
//        DepToTest mostRuns = toTest.sort { it.versions.size() }.last()
//        toTest.remove(mostRuns)
//        return mostRuns.versions.collect { VersionToTest testMe ->
//            testMe.tested = true
//            List<VersionToTest> testRun = [testMe]
//            toTest.each {
//                VersionToTest versionToTest = it.versions.find { !it.tested }
//                if (versionToTest) {
//                    testRun.add(versionToTest)
//                    versionToTest.tested = true
//                } else {
//                    testRun.add(it.versions.last())
//                }
//            }
//
//            new TestRun(versions: testRun)
//        }
//    }
//
//    enum Stage {
//        CheckoutLinked, SetupNpmLinks, BuildLinkedExamplesApp, DownloadBackendJar, RunCypressAgainstLinked, RunCypressForBackwardCompat
//    }
//    List<Stage> stages = [
//            Stage.CheckoutLinked,
//            Stage.SetupNpmLinks,
//            Stage.BuildLinkedExamplesApp,
//            Stage.DownloadBackendJar,
//            Stage.RunCypressAgainstLinked,
//            Stage.RunCypressForBackwardCompat,
//    ]
//
//    void test() {
//        List<TestDeps> toTest = new BackwardCompatHelper().load()
////        doTest()
////        log.info("Profile \n{}", CProf.prettyPrint())
//    }
//
////    @Profile
//    private void doTest() {
//
//        titlePrinter.printTitle("Test Dashboard Backwards Compatibility")
//        ProjectsOps projectOps = new ProjectsOps(workDir: workDir)
//        if (stages.contains(Stage.CheckoutLinked)) {
//            projectOps.checkoutLinkedNpmLibs();
//        }
//
//        if (stages.contains(Stage.DownloadBackendJar)) {
//            DownloadServiceJars downloadServiceJars = new DownloadServiceJars(outputDir: workDir)
//            downloadServiceJars.cleanOutputDir()
//            downloadServiceJars.download("backend", backendVersion)
//        }
//
//        testTheLatestLibCode(projectOps)
//
//        if (stages.contains(Stage.RunCypressForBackwardCompat)) {
//            runBackwardsCompatTests(projectOps)
//        }
//    }
//
//    private void testTheLatestLibCode(ProjectsOps projectOps) {
//        if (stages.contains(Stage.SetupNpmLinks)) {
//            new SetupNpmLinks(root: projectOps.skillsClient, shouldPrune: false).init().doLink()
//        }
//
//        if (stages.contains(Stage.BuildLinkedExamplesApp)) {
//            projectOps.buildClientIntApp()
//        }
//
//        if (stages.contains(Stage.RunCypressAgainstLinked)) {
//            runCypressTests(projectOps)
//        }
//    }
//
//    private void runBackwardsCompatTests(ProjectsOps projectOps) {
//        titlePrinter.printTitle("Running Backwards Compat tests")
//        new RemoveNpmLinks(root: projectOps.skillsClient, npmInstall: false).init().removeAnyExistingLinks()
//        List<TestDeps> toTest = new BackwardCompatHelper().load()
//
//        List<DepsRun> runsToPerform = generateRuns(toTest)
//
//        List<DepsRun> newAPI = runsToPerform.findAll({ !it.isOldApi })
//
//        AtomicInteger runNumber = new AtomicInteger(1)
//
//        List<NpmProj> intProjectsToUpdate = projectOps.allProj
//        buildIntegrationAppAndRunTests(projectOps, newAPI, intProjectsToUpdate, runNumber)
//
//        titlePrinter.printTitle("SUCCESS!! ALL tests passed! [${runNumber.get() - 1}] executions using different lib versions.")
//    }
//
//    private List<List<Deps>> buildIntegrationAppAndRunTests(ProjectsOps projectOps, List<DepsRun> runsToPerform, List<NpmProj> intProjectsToUpdate, AtomicInteger runNumber) {
//        runsToPerform.each {
//            List<Deps> thisRun = it.deps
//            thisRun.each { Deps projDeps ->
//                NpmProj packageToChange = intProjectsToUpdate.find({ it.name == projDeps.projName })
//                assert packageToChange, "Failed to find project with name ${projDeps.projName}"
//                updatePackageJsonDepsOld(packageToChange, projDeps)
//            }
//
//            titlePrinter.printSubTitle("Run #[${runNumber.get()}]: Prune old versions")
//            intProjectsToUpdate.findAll({ it.name.contains("-client-") }).each {
//                it.exec("npm prune")
//            }
//
//            String output = thisRun.collect { "${it.projName}. Versions ${it.deps.collect({ "${it.name}:${it.version}" }).join(", ")}" }.join("\n")
//            titlePrinter.printTitle("Run #[${runNumber.get()}], Old API=[${it.isOldApi}]: Running cypress test with: \n$output\n")
//            projectOps.buildClientIntApp()
//            runCypressTests(projectOps, output, "!!!!FAILED!!!! while running with:\n${output}", thisRun.deps.flatten().collect({ "${it.name}=${it.version}" }))
//            runNumber.incrementAndGet()
//        }
//    }
//
//    class DepsRun {
//        List<Deps> deps
//        boolean isOldApi = false
//    }
//
//    private List<DepsRun> generateRuns(List<TestDeps> toTest) {
//        List<DepsRun> res = []
//        List<String> coveredDeps = []
//        boolean performWork = true
//
//        while (performWork) {
//            List<Deps> thisRun = []
//            boolean stillWork = false;
//            toTest.each { TestDeps testDeps ->
//                boolean found = false;
//                depsLoop:
//                for (Deps depsForThisRun in testDeps.runWithDeps) {
//                    if (!coveredDeps.contains(depsForThisRun.uuid)) {
//                        coveredDeps.add(depsForThisRun.uuid)
//                        thisRun.add(depsForThisRun)
//                        found = true;
//                        stillWork = true;
//                        break depsLoop;
//                    }
//                }
//                // use the earliest (last in the list) if one is not found
//                if (!found) {
//                    thisRun.add(testDeps.runWithDeps.last())
//                }
//            }
//            if (stillWork) {
//                boolean isOldApi = thisRun.collect { it.deps.collect({ it.name }) }.flatten().contains("@skilltree/skills-client-configuration")
//                res.add(new DepsRun(deps: thisRun, isOldApi: isOldApi))
//            }
//            performWork = stillWork;
//        }
//
//        return res;
//    }
//
//
//    private Object updatePackageJsonDepsOld(NpmProj packageToChange, Deps depsForThisRun) {
//        assert packageToChange
//        assert depsForThisRun
//        def json = packageToChange.getPackageJson()
//        depsForThisRun.deps.each { Dep depToChange ->
//            json.dependencies."${depToChange.name}" = depToChange.version
//        }
//        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
//        File f = new File(packageToChange.loc, "package.json")
//        assert f.exists()
//        f.write(jsonToSave)
//
//        // sanity check
//        depsForThisRun.deps.each { Dep depToChange ->
//            assert packageToChange.packageJson.dependencies."$depToChange.name" == depToChange.version
//        }
//    }


}



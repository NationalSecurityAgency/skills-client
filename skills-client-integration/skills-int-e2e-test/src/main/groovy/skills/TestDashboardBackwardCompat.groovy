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

import callStack.profiler.CProf
import callStack.profiler.Profile
import groovy.json.JsonOutput
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import skills.backwardsCompat.BackwardCompatHelper
import skills.backwardsCompat.Dep
import skills.backwardsCompat.Deps
import skills.backwardsCompat.TestDeps

import java.util.concurrent.atomic.AtomicInteger

@Slf4j
class TestDashboardBackwardCompat {

    static void main(String[] args) {
        if (!args){
            println "FAILED! Missing param. Usage: TestDashboardBackwardCompat -backendVersion=<version>\n" +
                    "  Example: TestDashboardBackwardCompat -backendVersion=1.1.2-SNAPSHOT"
            System.exit(-1)
        }

        String backendVersionStr = args.find({ it.startsWith("-backendVersion=") })
        assert backendVersionStr, "Must supply -backendVersion param"
        String backendVersion = backendVersionStr.split("-backendVersion=")[1]
        new TestDashboardBackwardCompat(backendVersion: backendVersion).test()
    }

    String backendVersion
    File workDir = new File("./target/${TestDashboardBackwardCompat.class.simpleName}/")
    // private
    TitlePrinter titlePrinter = new TitlePrinter()
    enum Stage {
        CheckoutLinked, SetupNpmLinks, BuildLinkedExamplesApp, DownloadBackendJar, RunCypressAgainstLinked, RunCypressForBackwardCompat
    }
    List<Stage> stages = [
            Stage.CheckoutLinked,
            Stage.SetupNpmLinks,
            Stage.BuildLinkedExamplesApp,
            Stage.DownloadBackendJar,
            Stage.RunCypressAgainstLinked,
            Stage.RunCypressForBackwardCompat,
    ]

    void test() {
        doTest()
        log.info("Profile \n{}", CProf.prettyPrint())
    }

    @Profile
    private void doTest() {

        titlePrinter.printTitle("Release Dashboard")
        ProjectsOps projectOps = new ProjectsOps(workDir: workDir)
        if (stages.contains(Stage.CheckoutLinked)) {
            projectOps.checkoutLinkedNpmLibs();
        }

        if (stages.contains(Stage.DownloadBackendJar)) {
            DownloadServiceJars downloadServiceJars = new DownloadServiceJars(outputDir: workDir)
            downloadServiceJars.cleanOutputDir()
            downloadServiceJars.download("backend", backendVersion)
        }

        testTheLatestLibCode(projectOps)

        if (stages.contains(Stage.RunCypressForBackwardCompat)) {
            runBackwardsCompatTests(projectOps)
        }
    }

    private void testTheLatestLibCode(ProjectsOps projectOps) {
        if (stages.contains(Stage.SetupNpmLinks)) {
            new SetupNpmLinks(root: projectOps.skillsClient, shouldPrune: false).init().doLink()
        }

        if (stages.contains(Stage.BuildLinkedExamplesApp)) {
            projectOps.buildClientIntApp()
        }

        if (stages.contains(Stage.RunCypressAgainstLinked)) {
            runCypressTests(projectOps)
        }
    }

    private void runBackwardsCompatTests(ProjectsOps projectOps) {
        titlePrinter.printTitle("Running Backwards Compat tests")
        new SetupNpmLinks(root: projectOps.skillsClient).init().removeAnyExistingLinks()
        List<TestDeps> toTest = new BackwardCompatHelper().load()

        List<DepsRun> runsToPerform = generateRuns(toTest)

        List<DepsRun> oldAPI = runsToPerform.findAll({ it.isOldApi })
        List<DepsRun> newAPI = runsToPerform.findAll({ !it.isOldApi })

        AtomicInteger runNumber = new AtomicInteger(1)
        handleOldAPI(oldAPI, runNumber)

        List<NpmProj> intProjectsToUpdate = projectOps.allProj
        buildIntegrationAppAndRunTests(projectOps, newAPI, intProjectsToUpdate, runNumber)

        titlePrinter.printTitle("SUCCESS!! ALL tests passed! [${runNumber.get()-1}] executions using different lib versions.")
    }

    private void handleOldAPI(List<DepsRun> oldAPI, AtomicInteger runNumber){
        if (oldAPI){
            titlePrinter.printSubTitle("Executing tests based on old api")
            File clientExamples = new File(workDir, "skills-client-examples")
            if (clientExamples.exists()){
                FileUtils.deleteDirectory(clientExamples)
                log.info("Removed [{}]", clientExamples.absolutePath)
            }
            new ProcessRunner(loc: workDir).run("git clone git@gitlab.evoforge.org:skills/skills-client-examples.git")
            File examplesProj = new File(workDir, "skills-client-examples")
            new ProcessRunner(loc: examplesProj).run("git checkout 1.1.3")
            oldAPI.each { DepsRun depsRun ->
                assert depsRun.isOldApi
                List<Deps> thisRun = depsRun.deps
                List<NpmProj> projs = []
                thisRun.each { Deps projDeps ->
                    File loc = new File(workDir, "skills-client-examples/${projDeps.projName}")
                    assert loc.exists()
                    NpmProj packageToChange = new NpmProj(loc: loc, name: projDeps.projName)
                    updatePackageJsonDeps(packageToChange, projDeps)
                    projs.add(packageToChange)
                }

                titlePrinter.printSubTitle("Run #[${runNumber.get()}]: Prune old versions")
                projs.each {
                    it.exec("npm prune")
                }

                String output = thisRun.collect { "${it.projName}. Versions ${it.deps.collect({ "${it.name}:${it.version}" }).join(", ")}" }.join("\n")
                titlePrinter.printTitle("Run #[${runNumber.get()}], Old API=[${depsRun.isOldApi}]: Running cypress test with: \n$output\n")

                new ProcessRunner(loc: examplesProj).run("mvn --batch-mode clean package")

                File backendJar = workDir.listFiles().find({ it.name.startsWith("backend") && it.name.endsWith("jar") })

                assert backendJar.exists()
                File serviceJars = new File(examplesProj, "e2e-tests/target/servicesJars/")
                serviceJars.mkdirs()
                FileUtils.copyFile(backendJar, new File(serviceJars, backendJar.name))

                File examplesJar = new File(examplesProj, "skills-example-service/target/").listFiles().find({ it.name.startsWith("skills-example-service") && it.name.endsWith("jar") })
                assert examplesJar.exists()
                FileUtils.copyFile(examplesJar, new File(serviceJars, examplesJar.name))

                try {
                    String clientLibsMsg = thisRun.deps.flatten().collect({ "${it.name}=${it.version}" })
                    String msg = "\nbackend jar: ${backendJar.name},\nclientLibs:\n${clientLibsMsg}"
                    ProjectsOps projectsOps = new ProjectsOps()
                    projectsOps.runCypressTests(new File(examplesProj, "e2e-tests"), msg, thisRun.deps.flatten().collect({ "${it.name}=${it.version}" }), "examples")
                } catch (Throwable t) {
                    log.error("FAILED TO RUN: ${thisRun.deps.flatten().collect({ "${it.name}=${it.version}" })}")
                    throw t;
                }

                runNumber.incrementAndGet()
            }
        }
    }

    private List<List<Deps>> buildIntegrationAppAndRunTests(ProjectsOps projectOps, List<DepsRun> runsToPerform, List<NpmProj> intProjectsToUpdate, AtomicInteger runNumber) {
        runsToPerform.each {
            List<Deps> thisRun = it.deps
            thisRun.each { Deps projDeps ->
                NpmProj packageToChange = intProjectsToUpdate.find({ it.name == projDeps.projName })
                assert packageToChange, "Failed to find project with name ${projDeps.projName}"
                updatePackageJsonDeps(packageToChange, projDeps)
            }

            titlePrinter.printSubTitle("Run #[${runNumber.get()}]: Prune old versions")
            intProjectsToUpdate.findAll({ it.name.contains("-client-") }).each {
                it.exec("npm prune")
            }

            String output = thisRun.collect { "${it.projName}. Versions ${it.deps.collect({ "${it.name}:${it.version}" }).join(", ")}" }.join("\n")
            titlePrinter.printTitle("Run #[${runNumber.get()}], Old API=[${it.isOldApi}]: Running cypress test with: \n$output\n")
            projectOps.buildClientIntApp()
            runCypressTests(projectOps, output, "!!!!FAILED!!!! while running with:\n${output}", thisRun.deps.flatten().collect({ "${it.name}=${it.version}" }))
            runNumber.incrementAndGet()
        }
    }

    class DepsRun {
        List<Deps> deps
        boolean isOldApi = false
    }

    private List<DepsRun> generateRuns(List<TestDeps> toTest) {
        List<DepsRun> res = []
        List<String> coveredDeps = []
        boolean performWork = true

        while (performWork) {
            List<Deps> thisRun = []
            boolean stillWork = false;
            toTest.each { TestDeps testDeps ->
                boolean found = false;
                depsLoop:
                for (Deps depsForThisRun in testDeps.runWithDeps) {
                    if (!coveredDeps.contains(depsForThisRun.uuid)) {
                        coveredDeps.add(depsForThisRun.uuid)
                        thisRun.add(depsForThisRun)
                        found = true;
                        stillWork = true;
                        break depsLoop;
                    }
                }
                // use the earliest (last in the list) if one is not found
                if (!found) {
                    thisRun.add(testDeps.runWithDeps.last())
                }
            }
            if (stillWork) {
                boolean isOldApi = thisRun.collect { it.deps.collect({it.name})}.flatten() .contains("@skills/skills-client-configuration")
                res.add(new DepsRun(deps: thisRun, isOldApi: isOldApi))
            }
            performWork = stillWork;
        }

        return res;
    }

    private Object updatePackageJsonDeps(NpmProj packageToChange, Deps depsForThisRun) {
        assert packageToChange
        assert depsForThisRun
        def json = packageToChange.getPackageJson()
        depsForThisRun.deps.each { Dep depToChange ->
            json.dependencies."${depToChange.name}" = depToChange.version
        }
        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
        File f = new File(packageToChange.loc, "package.json")
        assert f.exists()
        f.write(jsonToSave)

        // sanity check
        depsForThisRun.deps.each { Dep depToChange ->
            assert packageToChange.packageJson.dependencies."$depToChange.name" == depToChange.version
        }
    }

    private void runCypressTests(ProjectsOps projectOps, String clientLibsMsg = " Latest using npm link", String errMessage = "!!!!FAILED!!!! while running latest code using 'npm link'", List<String> env = []) {
        File backendJar = workDir.listFiles().find({ it.name.startsWith("backend") && it.name.endsWith("jar") })

        assert backendJar.exists()
        File serviceJars = new File(projectOps.skillsClient, "skills-client-integration/skills-int-e2e-test/target/servicesJars/")
        serviceJars.mkdirs()
        FileUtils.copyFile(backendJar, new File(serviceJars, backendJar.name))

        File examplesJar = new File(projectOps.skillsClient, "skills-client-integration/skills-int-service/target/").listFiles().find({ it.name.startsWith("skills-int-service") && it.name.endsWith("jar") })
        assert examplesJar.exists()
        FileUtils.copyFile(examplesJar, new File(serviceJars, examplesJar.name))

        try {
            String msg = "\nbackend jar: ${backendJar.name},\nclientLibs:\n${clientLibsMsg}"
            projectOps.runCypressTests(new File(projectOps.skillsClient, "skills-client-integration/skills-int-e2e-test"), msg, env)
        } catch (Throwable t) {
            log.error(errMessage)
            throw t;
        }
    }
}



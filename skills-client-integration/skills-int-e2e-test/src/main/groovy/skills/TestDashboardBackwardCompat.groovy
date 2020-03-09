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
    File workDir = new File("./e2e-tests/target/${TestDashboardBackwardCompat.class.simpleName}/")
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

        if (projectOps.doClientLibsNeedsToBeReleased()) {
            if (stages.contains(Stage.SetupNpmLinks)) {
                new SetupNpmLinks(root: workDir, shouldPrune: false).init().doLink()
            }

            if (stages.contains(Stage.BuildLinkedExamplesApp)) {
                projectOps.buildClientExamplesApp()
            }
            if (stages.contains(Stage.RunCypressAgainstLinked)) {
                runCypressTests(projectOps)
            }
        } else {
            log.info("Client libs have not changed. No need to run tests against the linked libs")
        }

        if (stages.contains(Stage.RunCypressForBackwardCompat)) {
            runBackwardsCompatTests(projectOps)
        }
    }

    private void runBackwardsCompatTests(ProjectsOps projectOps) {
        titlePrinter.printTitle("Running Backwards Compat tests")
        new SetupNpmLinks(root: workDir).init().removeAnyExistingLinks()
        List<TestDeps> toTest = new BackwardCompatHelper().load()
        int runNumber = 1
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
                        NpmProj packageToChange = projectOps.allProj.find({ it.name == testDeps.projName })
                        updatePackageJsonDeps(packageToChange, depsForThisRun)

                        coveredDeps.add(depsForThisRun.uuid)
                        thisRun.add(depsForThisRun)
                        found = true;
                        stillWork = true;
                        break depsLoop;
                    }
                }
                // use the earliest (last in the list) if one is not found
                if (!found){
                    thisRun.add(testDeps.runWithDeps.last())
                }
            }

            performWork = stillWork;

            if (performWork) {
                titlePrinter.printSubTitle("Run #[${runNumber}]: Prune old versions")
                projectOps.allProj.findAll({ it.name.startsWith("skills-example-client") }).each {
                    it.exec("npm prune")
                }

                String output = thisRun.collect { "${it.projName}. Versions ${it.deps.collect({ "${it.name}:${it.version}" }).join(", ")}" }.join("\n")
                titlePrinter.printTitle("Run #[${runNumber}]: Running cypress test with: \n$output\n")
                projectOps.buildClientExamplesApp()
                runCypressTests(projectOps, output, "!!!!FAILED!!!! while running with:\n${output}", thisRun.deps.flatten().collect({ "${it.name}=${it.version}" }))
                runNumber++
            }
        }

        titlePrinter.printTitle("SUCCESS!! ALL tests passed! [${runNumber-1}] executions using different lib versions.")
    }

    private Object updatePackageJsonDeps(NpmProj packageToChange, Deps depsForThisRun) {
        assert packageToChange
        def json = packageToChange.getPackageJson()
        depsForThisRun.deps.each { Dep depToChange ->
            def foundDep = json.dependencies."${depToChange.name}"
            assert foundDep
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
        File serviceJars = new File(workDir, "skills-client-examples/e2e-tests/target/servicesJars/")
        serviceJars.mkdirs()
        FileUtils.copyFile(backendJar, new File(serviceJars, backendJar.name))

        File examplesJar = new File(workDir, "/skills-client-examples/skills-example-service/target").listFiles().find({ it.name.startsWith("skills-example-service") && it.name.endsWith("jar") })
        assert examplesJar.exists()
        FileUtils.copyFile(examplesJar, new File(serviceJars, examplesJar.name))

        try {
            String msg = "\nbackend jar: ${backendJar.name},\nclientLibs:\n${clientLibsMsg}"
            projectOps.runCypressTests(new File(workDir, "skills-client-examples/e2e-tests"), msg, env)
        } catch (Throwable t) {
            log.error(errMessage)
            throw t;
        }
    }
}



package skills

import callStack.profiler.CProf
import callStack.profiler.Profile
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import groovy.transform.ToString
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import skills.backwardsCompat.BackwardCompatHelper
import skills.backwardsCompat.Dep
import skills.backwardsCompat.Deps
import skills.backwardsCompat.TestDeps

@Slf4j
class ReleaseDashboard {

    static void main(String[] args) {
        new ReleaseDashboard().release()
    }

    File workDir = new File("./e2e-tests/target/releaseDashboardWorkDir/")
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

    void release() {
        doRelease()
        log.info("Profile \n{}", CProf.prettyPrint())
    }

    @Profile
    private void doRelease() {
        titlePrinter.printTitle("Release Dashboard")
        ProjectsOps projectOps = new ProjectsOps(releaseDir: workDir)
        if (stages.contains(Stage.CheckoutLinked)) {
            projectOps.checkoutLinkedNpmLibs();
        }

        if (stages.contains(Stage.DownloadBackendJar)) {
            DownloadServiceJars downloadServiceJars = new DownloadServiceJars(outputDir: workDir)
            downloadServiceJars.downloadLatestBackendSnapshot()
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
            titlePrinter.printTitle("Running Backwards Compat tests")
            new SetupNpmLinks(root: workDir).init().removeAnyExistingLinks()
            List<TestDeps> toTest = new BackwardCompatHelper().load()
            List<String> coveredDeps = []
            boolean performWork = true
            while (performWork) {
                List<Deps> thisRun = []
                toTest.each { TestDeps testDeps ->
                    depsLoop:
                    for (Deps depsForThisRun in testDeps.runWithDeps)
                        if (!coveredDeps.contains(depsForThisRun.uuid)) {
                            NpmProj packageToChange = projectOps.allProj.find({ it.name == testDeps.projName })
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

                            coveredDeps.add(depsForThisRun.uuid)
                            thisRun.add(depsForThisRun)
                            break depsLoop;
                        }
                }

                performWork = !thisRun.isEmpty();

                if (performWork) {
                    titlePrinter.printSubTitle("Prune old versions")
                    projectOps.allProj.findAll({ it.name.startsWith("skills-example-client") }).each {
                        it.exec("npm prune")
                    }

                    String output = thisRun.collect { "${it.projName}. Versions ${it.deps.collect({ "${it.name}:${it.version}" }).join(", ")}" }.join("\n")
                    titlePrinter.printSubTitle("Running with: \n$output\n")
                    projectOps.buildClientExamplesApp()
                    runCypressTests(projectOps, "!!!!FAILED!!!! while running with:\n${output}", thisRun.deps.collect({ "${it.name}=${it.version}" }))
                }
            }
        }
    }

    private void runCypressTests(ProjectsOps projectOps, String errMessage = "!!!!FAILED!!!! while running latest code using 'npm link'", List<String> env = []) {
        File backendJar = workDir.listFiles().find({ it.name.startsWith("backend") && it.name.endsWith("jar") })

        assert backendJar.exists()
        File serviceJars = new File(workDir, "skills-client-examples/e2e-tests/target/servicesJars/")
        serviceJars.mkdirs()
        FileUtils.copyFile(backendJar, new File(serviceJars, backendJar.name))

        File examplesJar = new File(workDir, "/skills-client-examples/skills-example-service/target").listFiles().find({ it.name.startsWith("skills-example-service") && it.name.endsWith("jar") })
        assert examplesJar.exists()
        FileUtils.copyFile(examplesJar, new File(serviceJars, examplesJar.name))

        try {
            projectOps.runCypressTests(new File(workDir, "skills-client-examples/e2e-tests"), backendJar.name, env)
        } catch (Throwable t){
            log.error(errMessage)
            throw t;
        }
    }

}



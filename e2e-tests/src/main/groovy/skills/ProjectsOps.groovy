package skills

import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class ProjectsOps {

    File releaseDir

    // private
    TitlePrinter titlePrinter = new TitlePrinter()
    String examplesProj = "skills-client-examples"
    private List<NpmProj> allProjCached

    List<NpmProj> getAllProj() {
        if (!allProjCached) {
            allProjCached = new NpmProjBuilder(loc: releaseDir).build()
        }
        return allProjCached
    }

    @Profile
    private void clearWorkDir() {
        log.info("releaseDir is [${releaseDir.absolutePath}]")
        if (releaseDir.exists()) {
            FileUtils.deleteDirectory(releaseDir)
            log.info("removed previous release dir [{}]", releaseDir.absolutePath)
        }

        assert !releaseDir.exists()
        releaseDir.mkdirs()
    }

    @Profile
    void checkoutLinkedNpmLibs() {
        clearWorkDir()
        titlePrinter.printTitle("Checkout client lib projects from git")
        List<String> projToCheckOut = new NpmProjBuilder(locate: false).build().findAll({ it.doOthersLinkToMe }).collect({ it.name })
        projToCheckOut.add(examplesProj)
        log.info("Cloning $projToCheckOut")
        for (String projName in projToCheckOut) {
            new ProcessRunner(loc: releaseDir).run("git clone git@gitlab.evoforge.org:skills/${projName}.git")
        }
    }


    @Profile
    boolean doClientLibsNeedsToBeReleased() {
        getNumClientLibsNeedsToRelease() > 0
    }

    @Profile
    int getNumClientLibsNeedsToRelease() {
        titlePrinter.printTitle("check if there is a need to release")
        int numProjChanged = 0
        for (NpmProj proj in allProj.findAll({ it.doOthersLinkToMe })) {
            titlePrinter.printSubTitle("checking ${proj.name}")
            if (proj.hasUnreleasedChanges()) {
                log.info("${proj.name} has has changes let's release")
                numProjChanged++
            } else {
                log.info("${proj.name} has no changes. Release is not needed!")
            }
        }

        return numProjChanged
    }

    @Profile
    void buildClientExamplesApp() {
        titlePrinter.printTitle("Building Client Examples App")
        File loc = new File(releaseDir, "skills-client-examples")
        new ProcessRunner(loc: loc).run("mvn --batch-mode clean package")
    }


    @Profile
    void runCypressTests(File location, String version, List<String> cypressEnv = []) {
        titlePrinter.printTitle("Start backend version [${version}] and examples")
        killServerProcesses()
        try {
            new ProcessRunner(loc: location, waitForOutput: false).run("npm run backend:start:release &")
            new ProcessRunner(loc: location, waitForOutput: false).run("npm run examples:start:release &")
            // this will install cypress, can do that while servers are starting
            new ProcessRunner(loc: location).run("npm install")
            new ProcessRunner(loc: location).run("npm run backend:waitToStart")
            new ProcessRunner(loc: location).run("npm run examples:waitToStart")

            titlePrinter.printTitle("Run Cypress Tests against backend version [${version}]")

            String env = cypressEnv ? " --env ${cypressEnv.join(",")}" : ""
            new ProcessRunner(loc: location).run("npx cypress run${env}")
        } finally {
            killServerProcesses()
        }
    }

    private void killServerProcesses() {
        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/backend_application.properties")
        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/examples_application.properties")
    }

}

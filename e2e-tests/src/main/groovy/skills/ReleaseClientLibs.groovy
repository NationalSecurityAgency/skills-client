package skills


import groovy.util.logging.Slf4j

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        String releaseType = args.find({ it.startsWith("releaseType=") })
        List<String> supportedReleaseTypes = ["patch", "minor", "major", "prepatch", "preminor", "premajor"]
        assert releaseType, "Must provide releaseType=${supportedReleaseTypes.join("|")}"
        releaseType = releaseType.split("releaseType=")[1]
        assert supportedReleaseTypes.contains(releaseType),  "Must provide releaseType=${supportedReleaseTypes.join("|")}"

        new ReleaseClientLibs(typeOfRelease: releaseType).doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
//    File workDir = new File("./target/releaseDir")
//    String examplesProj = "skills-client-examples"
    File examplesLoc = new File('./')
    File e2eDir = new File(examplesLoc, "e2e-tests")
    File releaseDir = new File(e2eDir, "/target/releaseClientLibs/")
    String typeOfRelease;

    DownloadServiceJars downloadServiceJars = new DownloadServiceJars(outputDir:  new File(e2eDir, "/target/servicesJars"))

    void doRelease() {

        log.info("examplesLoc is [${examplesLoc.absolutePath}]")
        log.info("e2eDir is [${examplesLoc.absolutePath}]")

        ProjectsOps npmProjects = new ProjectsOps(releaseDir: releaseDir)
        npmProjects.checkoutLinkedNpmLibs()
//        log.info("releaseDir is [${releaseDir.absolutePath}]")
//        if (releaseDir.exists()) {
//            FileUtils.deleteDirectory(releaseDir)
//            log.info("removed previous release dir [{}]", releaseDir.absolutePath)
//        }
//        assert !releaseDir.exists()
//        releaseDir.mkdirs()
//
//        titlePrinter.printTitle("Checkout client lib projects from git")
//        List<String> projToCheckOut = new NpmProjBuilder(locate: false).build().findAll({ it.doOthersLinkToMe }).collect({ it.name })
//        projToCheckOut.add(examplesProj)
//        log.info("Cloning $projToCheckOut")
//        for (String projName in projToCheckOut) {
//            new ProcessRunner(loc: releaseDir).run("git clone git@gitlab.evoforge.org:skills/${projName}.git")
//        }

        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProj> allProj = new NpmProjBuilder(loc: releaseDir).build()

        allProj.each {
            log.info("Will consider project [{}]", it.loc.absolutePath)
        }
        List<NpmProjRel> rels = new NpmProjBuilder(loc: releaseDir).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }


        titlePrinter.printTitle("check if there is a need to release")
        int numProjChanged = npmProjects.getNumClientLibsNeedsToRelease()
        if (numProjChanged == 0) {
            titlePrinter.printTitle("Nothing to release!")
            return
        } else {
            titlePrinter.printTitle("Code changes in [${numProjChanged}] projects, let's start testing to see if we can release")
        }

        titlePrinter.printTitle("Download latest skills-example-service")
        downloadServiceJars.download("skills-example-service", "1.0-SNAPSHOT")

        List<String> versions = getBackendVersionsToTest()
        titlePrinter.printTitle("Backend versions to test: ${versions}")

        versions.each { String version ->
            titlePrinter.printTitle("Testing against backend version [${version}]")
            downloadServiceJars.download("backend", version)
            runCypressTests(version)
        }

        titlePrinter.printTitle("OK Everything looks good! Let's release")
        boolean dryRun = true
        for (NpmProj proj in allProj.findAll({ it.doOthersLinkToMe })) {
            titlePrinter.printTitle("Release for ${proj.name}")
            if (proj.hasUnreleasedChanges()) {
                log.info("${proj.name} has has changes let's release")
                proj.exec("npm install", dryRun)
                proj.exec("npm run build", dryRun)
                proj.exec("release-it --ci ${typeOfRelease}", dryRun)

                List<NpmProjRel> updateVersion = rels.findAll({ it.to.name == proj.name })
                for (NpmProjRel updateRel in updateVersion) {
                    log.info("  Update version for [${updateRel.from.name}]: [${updateRel.from.getDepVersion("@skills/${updateRel.to.name}")}] -> [${updateRel.to.version}]")
                    updateRel.from.exec("npm install --save @skills/${updateRel.to.name}@${updateRel.to.version}", dryRun)
                    updateRel.from.exec("git push", dryRun)
                }
            } else {
                log.info("${proj.name} has no changes. Release is not needed!")
            }
        }
    }

//    private void runCypressTests(String version) {
//        titlePrinter.printTitle("Start backend version [${version}] and examples")
//        killServerProcesses()
//        try {
//            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run backend:start:release &")
//            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run examples:start:release &")
//            // this will install cypress, can do that while servers are starting
//            new ProcessRunner(loc: e2eDir).run("npm install")
//            new ProcessRunner(loc: e2eDir).run("npm run backend:waitToStart")
//            new ProcessRunner(loc: e2eDir).run("npm run examples:waitToStart")
//
//            titlePrinter.printTitle("Run Cypress Tests against backend version [${version}]")
//            new ProcessRunner(loc: e2eDir).run("npm run cy:run")
//        } finally {
//            killServerProcesses()
//        }
//    }
//
//    private void killServerProcesses() {
//        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/backend_application.properties")
//        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/examples_application.properties")
//    }

    List<String> getBackendVersionsToTest() {
        def url = "http://ip-10-113-80-244.evoforge.org/repository/maven-releases/skills/backend/maven-metadata.xml".toURL()
        String xmlContent = url.text
        def slurped = new XmlSlurper().parseText(xmlContent)
        List<String> res = slurped.versioning.versions.children().collect { it.text() }
        // todo: remove once 1.0.3 was cut and return > 1.0.3
        res = ["1.0.3-SNAPSHOT"]
        return res
    }

}

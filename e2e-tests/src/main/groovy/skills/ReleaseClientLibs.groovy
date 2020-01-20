package skills


import groovy.util.logging.Slf4j

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        new ReleaseClientLibs().doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
//    File workDir = new File("./target/releaseDir")
//    String examplesProj = "skills-client-examples"
    File examplesLoc = new File('./')
    File e2eDir = new File(examplesLoc, "e2e-tests")

    DownloadServiceJars downloadServiceJars = new DownloadServiceJars(e2eDir: e2eDir, titlePrinter: titlePrinter).init()

    void doRelease() {

        log.info("examplesLoc is [${examplesLoc.absolutePath}]")
        log.info("e2eDir is [${examplesLoc.absolutePath}]")
//        if (workDir.exists()){
//            FileUtils.deleteDirectory(workDir)
//        }
//        workDir.mkdirs()
//
//        titlePrinter.printTitle("Checkout projects from git")
//
//        List<String> projToCheckOut = new NpmProjBuilder(locate: false).build().findAll({ it.doOthersLinkToMe }).collect({ it.name })
//        projToCheckOut.add(examplesProj)
//        log.info("Cloning $projToCheckOut")
//        for (String projName in projToCheckOut) {
//            new ProcessRunner(loc: workDir).run("git clone git@gitlab.evoforge.org:skills/${projName}.git")
//        }
//
        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProj> allProj = new NpmProjBuilder(loc: examplesLoc).build()
        List<NpmProjRel> rels = new NpmProjBuilder(loc: examplesLoc).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }

//        titlePrinter.printTitle("check if there is a need to release")
//        int numProjChanged = 0
//        for (NpmProj proj in allProj.findAll({ it.doOthersLinkToMe })) {
//            titlePrinter.printSubTitle("checking ${proj.name}")
//            proj.gitPullRebase()
//            if (proj.hasUnreleasedChanges()) {
//                log.info("${proj.name} has has changes let's release")
//                numProjChanged++
//            } else {
//                log.info("${proj.name} has no changes. Release is not needed!")
//            }
//        }
//
//        if (numProjChanged == 0) {
//            titlePrinter.printTitle("Nothing to release!")
//            return
//        } else {
//            titlePrinter.printTitle("Code changes in [${numProjChanged}] projects, let's start testing to see if we can release")
//        }
//
//        titlePrinter.printTitle("git pull rebase all projects")
//        for (NpmProj proj in allProj) {
//            proj.gitPullRebase(true)
//        }
//
//        titlePrinter.printTitle("setup npm links")
//        new SetupNpmLinks(root: examplesLoc, shouldPrune: false).doLink()
//
//        titlePrinter.printTitle("Build examples jar with latest client libs")
//        new ProcessRunner(loc: examplesLoc).run("mvn package")
//

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
        for (NpmProj proj in allProj.findAll({ it.doOthersLinkToMe })) {
            titlePrinter.printTitle("Release for ${proj.name}")
            if (proj.hasUnreleasedChanges()) {
                log.info("${proj.name} has has changes let's release")
//                proj.
            } else {
                log.info("${proj.name} has no changes. Release is not needed!")
            }
        }
    }

    private void runCypressTests(String version) {
        titlePrinter.printTitle("Start backend version [${version}] and examples")
        killServerProcesses()
        try {
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run backend:start:release &")
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run examples:start:release &")
            // this will install cypress, can do that while servers are starting
            new ProcessRunner(loc: e2eDir).run("npm install")
            new ProcessRunner(loc: e2eDir).run("npm run backend:waitToStart")
            new ProcessRunner(loc: e2eDir).run("npm run examples:waitToStart")

            titlePrinter.printTitle("Run Cypress Tests against backend version [${version}]")
            new ProcessRunner(loc: e2eDir).run("npm run cy:run")
        } finally {
            killServerProcesses()
        }
    }

    private void killServerProcesses() {
        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/backend_application.properties")
        new ProcessUtils().killProcessIfContainsStr(":serverConfigs/examples_application.properties")
    }

    List<String> getBackendVersionsToTest() {
        def url = "http://ip-10-113-80-244.evoforge.org/repository/maven-releases/skills/backend/maven-metadata.xml".toURL()
        String xmlContent = url.text
        def slurped = new XmlSlurper().parseText(xmlContent)
        List<String> res = slurped.versioning.versions.children().collect { it.text() }
        // todo: remove once 1.0.3 was cut and return > 1.0.3
        res = ["1.0.3-SNAPSHOT"]
        return res
    }

//    private void pullDownJar(String artifact, String version) {
//        titlePrinter.printTitle("Pulling [${artifact}] jar version [${version}]")
//        String outputFile = "${artifact}-${version}.jar"
//        File outputDir = new File(e2eDir, "/target/servicesJars")
//        outputDir.mkdirs()
//        new File(outputDir, outputFile).delete()
//        new ProcessRunner(loc: outputDir)
//                .run("mvn --batch-mode dependency:get -Dartifact=skills:${artifact}:${version}:jar -Dtransitive=false -Ddest=${outputFile}".toString())
//
//        File expectedFile = new File(outputDir, outputFile)
//        assert expectedFile.exists(), "${expectedFile.absoluteFile.absolutePath}"
//    }

}

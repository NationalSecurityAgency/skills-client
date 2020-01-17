package skills

import groovy.util.logging.Slf4j

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        new ReleaseClientLibs().doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()

    void doRelease() {
        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProj> allProj = new NpmProjBuilder().build()
        List<NpmProjRel> rels = new NpmProjBuilder().buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }

        titlePrinter.printTitle("check if there is a need to release")
        int numProjChanged = 0
        for (NpmProj proj in allProj.findAll({it.doOthersLinkToMe})) {
            titlePrinter.printSubTitle("checking ${proj.name}")
            proj.gitPullRebase()
            if (proj.hasUnreleasedChanges()) {
                log.info("${proj.name} has has changes let's release")
                numProjChanged++
            } else {
                log.info("${proj.name} has no changes. Release is not needed!")
            }
        }

        if (numProjChanged == 0){
            titlePrinter.printTitle("Nothing to release!")
            return
        } else {
            titlePrinter.printTitle("Code changes in [${numProjChanged}] projects, let's start testing to see if we can release")
        }

        titlePrinter.printTitle("git pull rebase all projects")
        for (NpmProj proj in allProj) {
            proj.gitPullRebase(true)
        }

        titlePrinter.printTitle("setup npm links")
        new SetupNpmLinks().doLink()

        titlePrinter.printTitle("Build examples jar with latest client libs")
        new ProcessRunner(failWithErrMsg: false).run("mvn package")

        List<String> versions = getBackendVersionsToTest()
        versions.each { String version ->
            titlePrinter.printTitle("Testing against backend version [${version}]")
            pullDownBackendJar(version)
            runCypressTests(version)
        }

    }

    private void runCypressTests(String version) {
        titlePrinter.printTitle("Start backend version [${version}] and examples")
        killServerProcesses()
        try {
            File e2eDir = new File("e2e-tests")
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run backend:start &")
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run examples:start &")
            new ProcessRunner(loc: e2eDir).run("npm run backend:waitToStart") // TODO: change to a proper location
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
        return slurped.versioning.versions.children().collect { it.text() }
    }

    private void pullDownBackendJar(String version) {
        titlePrinter.printTitle("Pulling backend jar version [${version}]")
        String backendJarLoc = "e2e-tests/target/backendJars"
        String outputFile = "backend-toTest.jar"
        File outputDir = new File(backendJarLoc)
        outputDir.mkdirs()
        new File(outputDir, outputFile).delete()
        new ProcessRunner(loc: outputDir)
                .run("mvn --batch-mode dependency:get -Dartifact=skills:backend:${version}:jar -Dtransitive=false -Ddest=${outputFile}".toString())

        assert new File(backendJarLoc, outputFile).exists()
    }

}

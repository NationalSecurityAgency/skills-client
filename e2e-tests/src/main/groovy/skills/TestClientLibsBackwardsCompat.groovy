package skills


import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class TestClientLibsBackwardsCompat {

    static void main(String[] args) {
        new TestClientLibsBackwardsCompat().test()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
    File examplesLoc = new File('./')
    File e2eDir = new File(examplesLoc, "e2e-tests")
    File workDir = new File(e2eDir, "/target/${TestClientLibsBackwardsCompat.class.simpleName}")

    DownloadServiceJars downloadServiceJars = new DownloadServiceJars(outputDir: new File(e2eDir, "/target/servicesJars"))

    void test() {
        log.info("examplesLoc is [${examplesLoc.absolutePath}]")
        log.info("e2eDir is [${examplesLoc.absolutePath}]")
        downloadServiceJars.cleanOutputDir()
        if (workDir.exists()){
            log.info("Remove existing workdir [{}]", workDir)
            FileUtils.deleteDirectory(workDir)
        }
        workDir.mkdirs()

        ProjectsOps npmProjects = new ProjectsOps(workDir: workDir)
        npmProjects.checkoutLinkedNpmLibs()

        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProj> allProj = new NpmProjBuilder(loc: workDir).build()
        allProj.each { log.info("Will consider project [{}]", it.loc.absolutePath) }

        List<NpmProjRel> rels = new NpmProjBuilder(loc: workDir).buildRelMap()
        rels.each { log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})") }

        if (!doWeNeedToRelease(npmProjects)) {
//            return
        }

        String examplesProjName = "skills-example-service"
        String latestExamplesVersion = new NexusHelper(project: examplesProjName).getLatestSnapVersion()
        titlePrinter.printTitle("Download latest examples - ${examplesProjName}:${latestExamplesVersion}")
        downloadServiceJars.download(examplesProjName, latestExamplesVersion)

        // support started in 1.1
        List<String> versions = getBackendVersionsToTest()
        titlePrinter.printTitle("Backend versions to test: ${versions}")

        versions.each { String version ->
            titlePrinter.printTitle("Testing against backend version [${version}]")
            downloadServiceJars.download("backend", version)
            npmProjects.runCypressTests(e2eDir, "Testing with backend:${version}")
            downloadServiceJars.remove("backend", version)
        }
    }

    private List<String> backendExcludedVersions = ["1.1.0"]

    private List<String> getBackendVersionsToTest() {
        List<String> versions = new NexusHelper().getReleaseVersionsStaringWith("1.1")
        return versions.findAll({ !backendExcludedVersions.contains(it) })
    }

    boolean doWeNeedToRelease(ProjectsOps npmProjects) {
        titlePrinter.printTitle("check if there is a need to release")
        int numProjChanged = npmProjects.getNumClientLibsNeedsToRelease()
        if (numProjChanged == 0) {
            titlePrinter.printTitle("Client libs have not changed. So no reason to test!")
            return false
        }
        titlePrinter.printTitle("Code changes in [${numProjChanged}] projects, let's start testing")
        return true
    }

}

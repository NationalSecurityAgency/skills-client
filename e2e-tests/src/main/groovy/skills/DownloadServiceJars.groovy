package skills

import callStack.profiler.Profile
import groovy.util.logging.Slf4j

@Slf4j
class DownloadServiceJars {

    // configure
    File outputDir
    File e2eDir

    // internal
    TitlePrinter titlePrinter = new TitlePrinter()

    @Profile
    void download(String artifact, String version) {
        assert outputDir
        if (!outputDir.exists()){
            outputDir.mkdirs()
            log.info("Created [{}]", outputDir.absoluteFile.absolutePath)
        }
        titlePrinter.printTitle("Pulling [${artifact}] jar version [${version}]")
        String outputFile = "${artifact}-${version}.jar"
        File expectedFile = new File(outputDir, outputFile)
        if (expectedFile.exists()){
            log.info("Deleting existing [{}]", expectedFile.absoluteFile.absolutePath)
            expectedFile.delete()
        }
        assert !expectedFile.exists()
        new ProcessRunner(loc: outputDir)
                .run("mvn --batch-mode dependency:get -Dartifact=skills:${artifact}:${version}:jar -Dtransitive=false -Ddest=${outputFile}".toString())

        assert expectedFile.exists(), "${expectedFile.absoluteFile.absolutePath}"
    }

    void downloadLatestBackendSnapshot(){
        String version = new NexusHelper().getLatestSnapVersion()
        download("backend", version)
    }

}

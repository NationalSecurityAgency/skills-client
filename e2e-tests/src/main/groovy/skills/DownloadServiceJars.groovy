package skills

import org.apache.commons.io.FileUtils

class DownloadServiceJars {

    // configure
    TitlePrinter titlePrinter
    File e2eDir

    // internal
    File outputDir

    DownloadServiceJars init(){
        outputDir = new File(e2eDir, "/target/servicesJars")
        if (outputDir){
            FileUtils.deleteDirectory(outputDir)
        }
        outputDir.mkdirs()
        return this
    }


    void download(String artifact, String version) {
        assert outputDir
        titlePrinter.printTitle("Pulling [${artifact}] jar version [${version}]")
        String outputFile = "${artifact}-${version}.jar"
        new ProcessRunner(loc: outputDir)
                .run("mvn --batch-mode dependency:get -Dartifact=skills:${artifact}:${version}:jar -Dtransitive=false -Ddest=${outputFile}".toString())

        File expectedFile = new File(outputDir, outputFile)
        assert expectedFile.exists(), "${expectedFile.absoluteFile.absolutePath}"
    }

}

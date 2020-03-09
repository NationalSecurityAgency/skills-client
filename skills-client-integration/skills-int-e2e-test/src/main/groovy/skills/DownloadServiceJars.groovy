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

import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class DownloadServiceJars {

    // configure
    File outputDir
    File e2eDir

    // internal
    TitlePrinter titlePrinter = new TitlePrinter()

    @Profile
    void cleanOutputDir(){
        if (outputDir.exists()){
            outputDir.listFiles().findAll({it.name.endsWith(".jar")}).each {
                log.info("Removing [{}]", it)
                it.delete()
            }
        }
//        outputDir.mkdirs()
    }

    @Profile
    void remove(String artifact, String version) {
        File jar = getJarLoc(artifact, version)
        if (jar.exists()){
            log.info("Removing [{}]", jar)
            assert jar.delete()
        }
    }

    @Profile
    void download(String artifact, String version) {
        assert outputDir
        if (!outputDir.exists()){
            outputDir.mkdirs()
            log.info("Created [{}]", outputDir.absoluteFile.absolutePath)
        }
        titlePrinter.printTitle("Pulling [${artifact}] jar version [${version}]")
        File expectedFile = getJarLoc(artifact, version)
        if (expectedFile.exists()){
            log.info("Deleting existing [{}]", expectedFile.absoluteFile.absolutePath)
            expectedFile.delete()
        }
        assert !expectedFile.exists()
        new ProcessRunner(loc: outputDir)
                .run("mvn --batch-mode dependency:get -Dartifact=skills:${artifact}:${version}:jar -Dtransitive=false -Ddest=${expectedFile.name}".toString())

        assert expectedFile.exists(), "${expectedFile.absoluteFile.absolutePath}"
    }

    private File getJarLoc(String artifact, String version) {
        String outputFile = "${artifact}-${version}.jar"
        File expectedFile = new File(outputDir, outputFile)
        return expectedFile
    }

    void downloadLatestBackendSnapshot(){
        String version = new NexusHelper().getLatestSnapVersion()
        download("backend", version)
    }

}

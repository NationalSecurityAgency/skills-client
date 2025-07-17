/*
Copyright 2025 SkillTree

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

import groovy.cli.picocli.CliBuilder
import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import skills.helpers.NextVersionHelper

@Slf4j
class TestClientLibsBackwardsCompat {

    static void main(String[] args) {
        def cli = new CliBuilder()
        cli.record(type: boolean, 'record tests in cypress dashboard')
        cli.tag(type: String, 'tag to give cypress test')
        cli.minVersion(type: String, 'the minimum skills-service version to test against', defaultValue: '1.9.0')
        def options = cli.parse(args)
        def shouldRecord = options.record
        String tag
        if (options.tag && options.tag instanceof String) {
            tag = options.tag
        }
        String minVersionToTest
        if (options.minVersion && options.minVersion instanceof String) {
            minVersionToTest = options.minVersion
        }
        new TestClientLibsBackwardsCompat(recordInDashboard: shouldRecord, tag: tag, minVersionToTest: minVersionToTest).init().test()
    }

    private TitlePrinter titlePrinter = new TitlePrinter()
    private File e2eDir
    private String serviceName = "skills-service"
    boolean recordInDashboard = false
    String tag
    String minVersionToTest

    TestClientLibsBackwardsCompat init() {
        JsonSlurper jsonSlurper = new JsonSlurper()
        ['./', './skills-client-integration/skills-int-e2e-test'].each {
            File f = new File(it, "package.json")
            log.info("Checking [${f.absolutePath}] for e2e dir.")
            if (f.exists() && jsonSlurper.parse(f).name == "skills-int-e2e-test") {
                e2eDir = f.parentFile;
            }
        }
        assert e2eDir?.exists()
        log.info("e2e dir: [${e2eDir.absolutePath}")
        return this
    }

    void test() {
        List<File> versions = getBackendVersionsToTest()
        CypressTestsHelper cypressTestsHelper = new CypressTestsHelper(e2eDir: e2eDir, recordInDashboard: recordInDashboard, tag: "'${tag}'")
        versions.each { File versionFile ->
            titlePrinter.printTitle("Testing against skills-service version [${versionFile.name}]")
            prepSkillsServiceJar(versionFile)
            String version = (versionFile.name =~ /(?i)skills-service-(.*).jar/)[0][1]
            cypressTestsHelper.runCypressTests("Client Lib Backwards Compat against [${versionFile.name}]", ["skills-service.minVersion=${version}"])
        }
    }

    private void prepSkillsServiceJar(File jar) {
        String child = "skills-client-integration"
        File rootDir
        ["./", "../", "../../"].each {
            File dir = new File(it, child)
            if (dir.exists()) {
                rootDir = dir.parentFile.absoluteFile
            }
        }

        assert rootDir
        File serviceDir = new File(rootDir, this.serviceName)
        serviceDir.mkdirs()

        File dest = new File(serviceDir, jar.name)
        serviceDir.listFiles().each {
            if (it.name.startsWith(serviceName) && it.name.endsWith(".jar")) {
                log.info("Deleting [$it]")
                FileUtils.forceDelete(it)
            }
        }
        FileUtils.copyFile(jar, dest)
        log.info("Copy [$jar] => [$dest]")
    }

    private List<File> getBackendVersionsToTest() {
        List<File> versions = []
        ["./", "../", "../../"].findAll {
            File dir = new File(it, "skills-service-versions")
            if (dir.exists()) {
                dir.listFiles().each {
                    if (it.name.startsWith(serviceName) && it.name.endsWith(".jar")) {
                        versions.add(it)
                    }
                }
            }
        }
        versions = versions.sort({ it.name })
        List<File> versionsToTest = new NextVersionHelper().getVersionsToTest(minVersionToTest, versions)
        titlePrinter.printTitle("Backend versions to test:\n  ${versionsToTest.join('\n  ')}\n")
        return versionsToTest
    }
}

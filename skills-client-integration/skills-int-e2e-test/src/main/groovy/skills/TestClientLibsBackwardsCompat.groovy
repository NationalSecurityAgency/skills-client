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

import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import org.springframework.boot.autoconfigure.jsonb.JsonbAutoConfiguration

@Slf4j
class TestClientLibsBackwardsCompat {

    static void main(String[] args) {
        new TestClientLibsBackwardsCompat().init().test()
    }

    private TitlePrinter titlePrinter = new TitlePrinter()
    private File e2eDir
    private String serviceName = "skills-service"

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
        List<String> versions = getBackendVersionsToTest()
        versions.each { File version ->
            titlePrinter.printTitle("Testing against backend version [${version.name}]")
            prepSkillsServiceJar(version)
            doRunCypressTests(version.name)
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
        titlePrinter.printTitle("Backend versions to test:\n  ${versions.join('\n  ')}\n")
        return versions
    }

    private void doRunCypressTests(String version) {
        titlePrinter.printTitle("Running cypress tests against skill-service: [${version}]")
        new ProcessRunner(loc: e2eDir).run("npm install")
        new ProcessRunner(loc: e2eDir, failWithErrMsg: false).run("npm run cyServices:kill")
        try {
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run cyServices:start:skills-service:ci")
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run cyServices:start:integration-apps")

            titlePrinter.printSubTitle("Starting Cypress to tests against skill-service: [${version}]")

            new ProcessRunner(loc: e2eDir).run("npx cypress run")
        } finally {
            new ProcessRunner(loc: e2eDir, failWithErrMsg: false).run("npm run cyServices:kill")
        }
    }

}

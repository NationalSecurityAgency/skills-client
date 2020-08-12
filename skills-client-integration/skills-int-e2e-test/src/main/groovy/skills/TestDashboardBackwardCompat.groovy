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

import groovy.json.JsonOutput
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import org.springframework.core.io.Resource
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.core.io.support.ResourcePatternResolver

@Slf4j
class TestDashboardBackwardCompat {

    static void main(String[] args) {
        new TestDashboardBackwardCompat().testNew()
    }

    File workDir = new File("./target/skills-client")
    TitlePrinter titlePrinter = new TitlePrinter()
    List<String> versionsToExclude = ["2.0.0"]

    void checkoutWorkingCopy() {
        if (workDir.exists()) {
            FileUtils.deleteDirectory(workDir)
            log.info("Removed [$workDir]")
        }
        new ProcessRunner(loc: workDir.parentFile).run("git clone https://github.com/NationalSecurityAgency/skills-client.git")
    }

    private void copyServiceJar() {
        File serviceDir = new File(workDir, "skills-service")
        serviceDir.mkdir()
        log.info("Searching for jar, starting dir [${new File("./").absolutePath}]")
        File serviceJar
        ["./skills-service", "../../skills-service"].each {
            if (!serviceJar) {
                serviceJar = new File(it).listFiles().find({ it?.name.startsWith("skills-service") && it?.name.endsWith(".jar") })
            }
        }
        assert serviceJar
        assert serviceJar
        File dest = new File(serviceDir, serviceJar.name)
        FileUtils.copyFile(serviceJar, dest)
        assert dest.exists()
        log.info("Copied service jar to [$dest]")
    }

    void applyPatch(String version) {
        /**
         * To create patch file:
         * git add .
         * git diff --cached > X-X-X.patch
         */

        ClassLoader cl = this.getClass().getClassLoader()
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(cl)
        Resource[] resources = resolver.getResources("classpath*:/versionPatches/*")
        String patchFile = version.replace(".", "-") + ".patch"
        Resource found = resources.find { it.filename.endsWith(patchFile) }
        if (found) {
            FileUtils.copyToFile(found.inputStream, new File(workDir, patchFile))
        }
        new ProcessRunner(loc: workDir).run("git apply ${patchFile}")
    }

    void testNew() {
        checkoutWorkingCopy()
        File clientIntLoc = new File(workDir, "skills-client-integration")
        File e2eLoc = new File(clientIntLoc, "skills-int-e2e-test")

        String tagsStrs = new ProcessRunner(loc: workDir).run("git tag").sout
        assert tagsStrs
        List<String> versionsToTest = tagsStrs.split("\n").toList();
        versionsToTest.removeAll(versionsToExclude)
        log.info("Versions to test:\n  ${versionsToTest.join("\n  ")}")

        for (String version : versionsToTest) {
            titlePrinter.printTitle("Testing version [${version}]")

            new ProcessRunner(loc: workDir).run("git checkout ${version}")
            assert new ProcessRunner(loc: workDir).run("git status").sout.contains(version)
            applyPatch(version)
            copyServiceJar()

            List<NpmProj> allProjects = new NpmProjBuilder(loc: workDir, version: version).build()
            List<NpmProj> intProjs = allProjects.findAll({ it.hasLinksToOtherProjects && it.name.contains("-int-") })

            titlePrinter.printSubTitle("[${version}]: Update package.json and prune")
            intProjs.each { NpmProj intProj ->
                String lookForDep = intProj.name.replaceAll("-int", "")
                updatePackageJsonDeps(intProj, "@skilltree/$lookForDep", version)
                intProj.exec("npm prune")
            }

            titlePrinter.printSubTitle("[${version}]: Building Client Examples App")
            new ProcessRunner(loc: clientIntLoc).run("mvn --batch-mode clean package")

            titlePrinter.printSubTitle("[${version}]: Running cypress test with")
            String output = "Testing version [$version]"
            runCypressTests(e2eLoc, output, "!!!!FAILED!!!! while running with:\n${output}")
        }
    }

    private Object updatePackageJsonDeps(NpmProj packageToChange, String depName, String version) {
        assert packageToChange && depName && version
        def json = packageToChange.getPackageJson()
        json.dependencies."${depName}" = version
        String jsonToSave = JsonOutput.prettyPrint(JsonOutput.toJson(json))
        File f = new File(packageToChange.loc, "package.json")
        assert f.exists()
        f.write(jsonToSave)

        // sanity check
        assert packageToChange.packageJson.dependencies."${depName}" == version
    }

    private void runCypressTests(File e2eProj, String clientLibsMsg = " Latest using npm link", String errMessage = "!!!!FAILED!!!! while running latest code using 'npm link'", List<String> env = []) {
        try {
            doRunCypressTests(e2eProj, clientLibsMsg, env)
        } catch (Throwable t) {
            log.error(errMessage)
            throw t;
        }
    }

    private void doRunCypressTests(File e2eProj, String msg, List<String> cypressEnv = [], String npmIntegrationNamespace = "integration") {
        titlePrinter.printTitle("Running cypress tests: [${msg}]")
        new ProcessRunner(loc: e2eProj).run("npm install")
        new ProcessRunner(loc: e2eProj, failWithErrMsg: false).run("npm run cyServices:kill")
        try {
            new ProcessRunner(loc: e2eProj, waitForOutput: false).run("npm run cyServices:start:skills-service:ci")
            new ProcessRunner(loc: e2eProj, waitForOutput: false).run("npm run cyServices:start:integration-apps")

            titlePrinter.printSubTitle("Starting Cypress tests [${msg}]")

            String env = cypressEnv ? " --env ${cypressEnv.join(",")}" : ""
            new ProcessRunner(loc: e2eProj).run("npx cypress run${env}")
        } finally {
            new ProcessRunner(loc: e2eProj, failWithErrMsg: false).run("npm run cyServices:kill")
        }
    }
}



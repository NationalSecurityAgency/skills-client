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

import groovy.util.logging.Slf4j

@Slf4j
class CypressTestsHelper {

    private TitlePrinter titlePrinter = new TitlePrinter()
    boolean recordInDashboard = false
    String tag
    File e2eDir

    void runCypressTests(String msg, List<String> cypressEnv = []) {
        try {
            doRunCypressTests(msg, cypressEnv)
        } catch (Throwable t) {
            log.error("Failed while running: [$msg]")
            throw t;
        }
    }

    private void doRunCypressTests(String msg, List<String> cypressEnv = []) {
        assert e2eDir
        titlePrinter.printTitle("Running cypress tests: [${msg}]")
        new ProcessRunner(loc: e2eDir).run("npm install")
        new ProcessRunner(loc: e2eDir, failWithErrMsg: false).run("npm run cyServices:kill")
        try {
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run cyServices:start:skills-service:ci")
            new ProcessRunner(loc: e2eDir, waitForOutput: false).run("npm run cyServices:start:integration-apps")

            String env = cypressEnv ? " --env ${cypressEnv.join(",")}" : ""
            if (recordInDashboard) {
                env += ' --record'
                if (tag) {
                    env += " --tag \"${tag}\""
                }
            }
            titlePrinter.printSubTitle("Starting Cypress to tests: [${msg}], env=[$env]")
            new ProcessRunner(loc: e2eDir).run("npx cypress run${env}")
        } finally {
            new ProcessRunner(loc: e2eDir, failWithErrMsg: false).run("npm run cyServices:kill")
        }
    }
}

package skills

import groovy.util.logging.Slf4j

@Slf4j
class CypressTestsHelper {

    private TitlePrinter titlePrinter = new TitlePrinter()
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
            titlePrinter.printSubTitle("Starting Cypress to tests: [${msg}], env=[$env]")
            new ProcessRunner(loc: e2eDir).run("npx cypress run${env}")
        } finally {
            new ProcessRunner(loc: e2eDir, failWithErrMsg: false).run("npm run cyServices:kill")
        }
    }
}

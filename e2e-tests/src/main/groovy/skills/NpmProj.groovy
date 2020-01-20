package skills

import groovy.json.JsonSlurper
import groovy.transform.ToString
import groovy.util.logging.Slf4j

@ToString(includeNames = true, excludes = "modulesDir, packageJson")
@Slf4j
class NpmProj {
    // indicates a client lib that we need to link to
    boolean doOthersLinkToMe
    String name
    File loc
    // indicates whether it has node_modules/@skills/
    boolean hasLinksToOtherProjects = true

    ProcessRunner.ProcessRes exec(String command, boolean dryRun = false) {
        if (!dryRun) {
            log.info("${loc.name} command: ${command}")
        }
        ProcessRunner.ProcessRes processRes = new ProcessRunner(loc: loc, dryRun: dryRun, failWithErrMsg: false).run(command)
        return processRes
    }

    File getModulesDir() {
        File modules = new File(loc, "node_modules/@skills/")
        assert modules.exists()
        return modules
    }


    static JsonSlurper slurper = new JsonSlurper()

    def getPackageJson() {
        slurper.parse(new File(loc, "package.json"))
    }

    String getVersion() {
        return packageJson.version
    }

    String getDepVersion(String dep) {
        return packageJson.dependencies."$dep"
    }

    void gitPullRebase(boolean dryRun = false) {
        new ProcessRunner(loc: loc, dryRun: dryRun).run("git pull --rebase")
    }

    boolean hasUnreleasedChanges() {
        ProcessRunner.ProcessRes processRes = new ProcessRunner(loc: loc, printOutput: false).run("git diff ${version}".toString())
        if (processRes.sout) {
            return true
        }
        return false
    }
}

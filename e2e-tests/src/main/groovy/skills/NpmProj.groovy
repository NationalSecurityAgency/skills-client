package skills

import groovy.transform.ToString
import groovy.util.logging.Slf4j

@ToString(includeNames = true)
@Slf4j
class NpmProj {
    // indicates a client lib that we need to link to
    boolean linkTo
    File loc
    // indicates whether it has node_modules/@skills/
    boolean hasLinksToOtherProjects = true

    void exec(String command) {
        assert command
        log.info("${loc.name} command: ${command}")
        Process p = command.execute(null, loc)
        p.waitForProcessOutput(System.out, System.err)
    }

    File getModulesDir(){
        File modules = new File(loc, "node_modules/@skills/")
        assert modules.exists()
        return modules
    }

    def getPackageJson(){

    }
}

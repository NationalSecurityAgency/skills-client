package skills.backwardsCompat

import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import skills.TitlePrinter

@Slf4j
class BackwardCompatHelper {

    List<TestDeps> load(){
        File confJson = new File("./e2e-tests/conf/Backend-backwards-compat-veresions.json")
        //new File(workDir, "${projectOps.examplesProj}/e2e-tests/conf/Backend-backwards-compat-veresions.json")
        def versionConf = new JsonSlurper().parse(confJson)
        List<TestDeps> buildWithDeps = versionConf.collect { libItem ->
            String libName = libItem.key
            List<Deps> runWithDeps = libItem.value.collect { depsToUpdate ->
                List<Dep> deps = depsToUpdate.collect {
                    new Dep(name: it.dep, version: it.version)
                }
                new Deps(deps: deps, projName: libName)
            }

            new TestDeps(projName:libName, runWithDeps: runWithDeps)
        }

        new TitlePrinter().printTitle("Backwards Compatibility Plan")
        buildWithDeps.each {
            log.info("[{}] test with the following deps:", it.projName)
            it.runWithDeps.each { Deps deps ->
                log.info("     {}", deps.deps.collect({"${it.name}:${it.version}"}).join(", "))
            }
        }

        return buildWithDeps
    }
}

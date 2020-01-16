package skills

import groovy.util.logging.Slf4j

import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldPrune = args.find({ it.equalsIgnoreCase("--prune") })
        new SetupNpmLinks(shouldPrune: shouldPrune).doLink()
    }

    boolean shouldPrune = true

    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        List<NpmProj> projs = new NpmProjBuilder().build()

        printTitle("npm prune and npm install")
        projs.each {
            if (shouldPrune){
                it.exec("npm prune")
            }
            it.exec("npm install")
        }

        printTitle("create links")
        projs.findAll({ it.linkTo }).each {
            it.exec("npm link")
        }

        printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.modulesDir.eachFile { File module ->
                log.info("Linking module [{}]", module.absolutePath)
                npmProj.exec("npm link @skills/${module.name}".toString())
            }
        }

        printTitle("validate links")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            log.info("validating [{}]", npmProj.modulesDir.absolutePath)
            npmProj.modulesDir.eachFile {
                assert Files.isSymbolicLink(it.toPath())
            }
            npmProj.exec("ls -l node_modules/@skills/")
        }
    }

    private printTitle(String title) {
        log.info("\n------------------------------------------------------------\n" +
                "\n-------- $title --------\n" +
                "\n------------------------------------------------------------\n")
    }
}

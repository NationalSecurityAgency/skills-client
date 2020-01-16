package skills

import groovy.util.logging.Slf4j

import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldPrune = args.find({ it.equalsIgnoreCase("--prune") })
        new SetupNpmLinks(shouldPrune: shouldPrune).doLink()
    }

    boolean shouldPrune = false
    TitlePrinter titlePrinter = new TitlePrinter()

    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        List<NpmProj> projs = new NpmProjBuilder().build()

        titlePrinter.printTitle("npm prune and npm install")
        projs.each {
            if (shouldPrune){
                it.exec("npm prune")
            }
            it.exec("npm install")
        }

        titlePrinter.printTitle("create links")
        projs.findAll({ it.linkTo }).each {
            it.exec("npm link")
        }

        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.modulesDir.eachFile { File module ->
                titlePrinter.printSubTitle("Linking module [${module.absolutePath}]")
                npmProj.exec("npm link @skills/${module.name}".toString())
            }
        }

        titlePrinter.printTitle("validate links")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.modulesDir.absolutePath}]")
            npmProj.modulesDir.eachFile {
                assert Files.isSymbolicLink(it.toPath())
            }
            npmProj.exec("ls -l node_modules/@skills/")
        }
    }


}

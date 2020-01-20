package skills

import callStack.profiler.CProf
import callStack.profiler.Profile
import groovy.util.logging.Slf4j

import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldNotPrune = args.find({ it.equalsIgnoreCase("--noPrune") })
        new SetupNpmLinks(shouldPrune: !shouldNotPrune).doLink()
        log.info("Execution Prof:\n{}", CProf.prettyPrint())
    }

    File root = new File("./")
    boolean shouldPrune = true
    TitlePrinter titlePrinter = new TitlePrinter()

    @Profile
    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        List<NpmProj> projs = new NpmProjBuilder(loc: root).build()

        npmInstall(projs)
        createLinks(projs)
        npmLinkToSkills(projs)
        validateLinks(projs)
        build(projs)
    }

    @Profile
    private void build(List<NpmProj> projs) {
        titlePrinter.printTitle("build")
        projs.each { NpmProj npmProj ->
            npmProj.exec("npm run build")
        }
    }

    @Profile
    private void validateLinks(List<NpmProj> projs) {
        titlePrinter.printTitle("validate links")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.modulesDir.absolutePath}]")
            npmProj.exec("ls -l node_modules/@skills/")
            npmProj.modulesDir.eachFile {
                assert Files.isSymbolicLink(it.toPath())
            }
        }
    }

    @Profile
    private void npmLinkToSkills(List<NpmProj> projs) {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.modulesDir.eachFile { File module ->
                titlePrinter.printSubTitle("Linking module [${module.absolutePath}]")
                npmProj.exec("npm link @skills/${module.name}".toString())
            }
        }
    }

    @Profile
    private void createLinks(List<NpmProj> projs) {
        titlePrinter.printTitle("create links")
        projs.findAll({ it.doOthersLinkToMe }).each {
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("npm link")
        }
    }

    @Profile
    private void npmInstall(List<NpmProj> projs) {
        titlePrinter.printTitle("npm prune and npm install")
        projs.each {
            titlePrinter.printSubTitle("install and prune ${it.loc.name}")
            if (shouldPrune) {
                it.exec("npm prune")
            }
            it.exec("npm install")
        }
    }
}

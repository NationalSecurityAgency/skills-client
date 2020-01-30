package skills

import callStack.profiler.CProf
import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldNotPrune = args.find({ it.equalsIgnoreCase("--noPrune") })
        new SetupNpmLinks(shouldPrune: !shouldNotPrune).doLink()
        log.info("Execution Prof:\n{}", CProf.prettyPrint())
    }

    File root = new File("./")
    boolean shouldPrune = false
    TitlePrinter titlePrinter = new TitlePrinter()

    @Profile
    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        List<NpmProj> projs = new NpmProjBuilder(loc: root).build()

        removeAnyExistingLinks(projs)
        npmInstall(projs)
        createLinks(projs)
        npmLinkToSkills(projs)
        npmLinkToReact(projs)
        validateLinks(projs)
        build(projs)
    }

    @Profile
    private void removeAnyExistingLinks(List<NpmProj> projs) {
        titlePrinter.printTitle("removing existing links")
        projs.each { NpmProj proj ->
            File moduleDir = proj.getSkillsModulesDir(false)
            if (moduleDir.exists()) {
                moduleDir?.eachDir { File depDir ->
                    log.info("Deleting [{}]", depDir.absoluteFile.absolutePath)
                    FileUtils.deleteDirectory(depDir.absoluteFile)
                }
            }
            if (proj.isReactApp()) {
                File reactModuleDir = proj.getReactModuleDir(false)
                if (reactModuleDir.exists()) {
                    log.info("Deleting [{}]", reactModuleDir.absoluteFile.absolutePath)
                    FileUtils.deleteDirectory(reactModuleDir.absoluteFile)
                }
            }
        }
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
            titlePrinter.printSubTitle("validating [${npmProj.getSkillsModulesDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/@skills/")
            npmProj.getSkillsModulesDir().eachFile {
                assert Files.isSymbolicLink(it.toPath())
            }
        }

        projs.findAll({ it.isReactApp() }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.getReactModuleDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/react/")
            assert Files.isSymbolicLink(npmProj.getReactModuleDir().toPath())
        }
    }

    @Profile
    private void npmLinkToSkills(List<NpmProj> projs) {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.getSkillsModulesDir().eachFile { File module ->
                titlePrinter.printSubTitle("Linking module [${module.absolutePath}]")
                npmProj.exec("npm link @skills/${module.name}".toString())
            }
        }
    }

    @Profile
    private void npmLinkToReact(List<NpmProj> projs) {
        titlePrinter.printTitle("link react")
        projs.findAll({ it.reactApp }).each { NpmProj npmProj ->
            File reactModuleDir = projs.find { it.reactModule }.getReactModuleDir()
            titlePrinter.printSubTitle("Linking react module [${reactModuleDir.absoluteFile.absolutePath}]")
            npmProj.exec("npm link ${reactModuleDir.absoluteFile.absolutePath}".toString())
        }
    }

    @Profile
    private void createLinks(List<NpmProj> projs) {
        titlePrinter.printTitle("create links")
        projs.findAll({ it.doOthersLinkToMe }).each {
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("ls")
            it.exec("node -v")
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

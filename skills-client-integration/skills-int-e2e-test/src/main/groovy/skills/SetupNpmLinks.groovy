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

import callStack.profiler.CProf
import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

import javax.print.attribute.SetOfIntegerSyntax
import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldPrune = args.find({ it.equalsIgnoreCase("--prune") })
        new SetupNpmLinks(shouldPrune: shouldPrune).init().doLink()
        log.info("Execution Prof:\n{}", CProf.prettyPrint())
    }

    // configure
    File root = new File("./")
    boolean shouldPrune = false

    // private
    TitlePrinter titlePrinter = new TitlePrinter()
    List<NpmProj> projs
    SetupNpmLinks init(){
        projs = new NpmProjBuilder(loc: root).build()
        return this
    }

    @Profile
    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        assert projs
        removeAnyExistingLinks()
        npmInstall()
        createLinks()
        npmLinkToSkills()
        npmLinkToReact()
        validateLinks()
        build()
    }

    @Profile
    void removeAnyExistingLinks() {
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
    private void build() {
        titlePrinter.printTitle("build")
        projs.each { NpmProj npmProj ->
            npmProj.exec("npm run build")
        }
    }

    @Profile
    private void validateLinks() {
        titlePrinter.printTitle("validate links")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.getSkillsModulesDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/@skills/")
            npmProj.skillsDependenciesFromPackageJson.each {
                File shouldBeSymbolic = new File(npmProj.loc, "node_modules/${it}")
                assert shouldBeSymbolic.exists()
                assert Files.isSymbolicLink(shouldBeSymbolic.toPath())
            }
        }

        projs.findAll({ it.isReactApp() }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.getReactModuleDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/react/")
            assert Files.isSymbolicLink(npmProj.getReactModuleDir().toPath())
        }
    }

    @Profile
    private void npmLinkToSkills() {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.skillsDependenciesFromPackageJson.each {
                titlePrinter.printSubTitle("Linking module [${it}]")
                npmProj.exec("npm link ${it}".toString())
            }
        }
    }

    @Profile
    private void npmLinkToReact() {
        titlePrinter.printTitle("link react")
        projs.findAll({ it.reactApp }).each { NpmProj npmProj ->
            File reactModuleDir = projs.find { it.reactModule }.getReactModuleDir()
            titlePrinter.printSubTitle("Linking react module [${reactModuleDir.absoluteFile.absolutePath}]")
            npmProj.exec("npm link ${reactModuleDir.absoluteFile.absolutePath}".toString())
        }
    }

    @Profile
    private void createLinks() {
        titlePrinter.printTitle("create links")
        projs.findAll({ it.doOthersLinkToMe }).each {
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("ls")
            it.exec("node -v")
            it.exec("npm link")
        }
    }

    @Profile
    private void npmInstall() {
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

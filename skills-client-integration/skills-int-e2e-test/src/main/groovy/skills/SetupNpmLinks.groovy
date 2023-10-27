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

//import callStack.profiler.CProf
//import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

import javax.print.attribute.SetOfIntegerSyntax
import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    static void main(String[] args) {
        boolean shouldPrune = args.find({ it.equalsIgnoreCase("--prune") })
        new SetupNpmLinks(shouldPrune: shouldPrune).init().doLink()
//        log.info("Execution Prof:\n{}", CProf.prettyPrint())
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

//    @Profile
    void doLink() {
        log.info("Should Prune = [{}]", shouldPrune)
        assert projs
        new RemoveNpmLinks(shouldPrune: shouldPrune, npmInstall: false).init().removeAnyExistingLinks()
        createLinks()
        npmLinkToSkills()
        install()
        validateLinks()
        build()
    }

//    @Profile
    private void install() {
        titlePrinter.printTitle("install")
        projs.each { NpmProj npmProj ->
            npmProj.exec("npm install --force")
        }
    }

//    @Profile
    private void build() {
        titlePrinter.printTitle("build")
        projs.each { NpmProj npmProj ->
            npmProj.exec("npm run build")
        }
    }

//    @Profile
    private void validateLinks() {
        titlePrinter.printTitle("validate links")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.getSkillsModulesDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/@skilltree/")
            npmProj.skillsDependenciesFromPackageJson.each {
                File shouldBeSymbolic = new File(npmProj.loc, "node_modules/${it}")
                assert shouldBeSymbolic.exists()
                assert Files.isSymbolicLink(shouldBeSymbolic.toPath())
            }
        }
    }

//    @Profile
    private void npmLinkToSkills() {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.skillsDependenciesFromPackageJson.each {
                titlePrinter.printSubTitle("Linking module [${it}] in project [${npmProj}]")

                npmProj.exec("npm link --force ${it}".toString())
            }
        }
    }

//    @Profile
    private void createLinks() {
        titlePrinter.printTitle("create links")
        projs.findAll({ it.doOthersLinkToMe }).each {
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("ls")
            it.exec("node -v")
            it.exec("npm link")
        }
    }
}

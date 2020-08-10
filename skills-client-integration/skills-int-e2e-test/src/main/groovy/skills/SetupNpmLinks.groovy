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
        npmLinkToReact()
        validateLinks()
        build()
    }

//    @Profile
    private void install() {
        titlePrinter.printTitle("install")
        projs.each { NpmProj npmProj ->
            if (!npmProj.isAngularModule()) {
                // angular modules were installed within createLinks()
                npmProj.exec("npm install")
            }
        }
    }

//    @Profile
    private void build() {
        titlePrinter.printTitle("build")
        projs.each { NpmProj npmProj ->
            if (!npmProj.isAngularModule()) {
                // angular modules were built within createLinks()
                npmProj.exec("npm run build")
            }
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

        projs.findAll({ it.isReactApp() }).each { NpmProj npmProj ->
            titlePrinter.printSubTitle("validating [${npmProj.getReactModuleDir().absolutePath}]")
            npmProj.exec("ls -l node_modules/react/")
            assert Files.isSymbolicLink(npmProj.getReactModuleDir().toPath())
        }
    }

//    @Profile
    private void npmLinkToSkills() {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.skillsDependenciesFromPackageJson.each {
                titlePrinter.printSubTitle("Linking module [${it}]")
                npmProj.exec("npm link ${it}".toString())
                if (npmProj.getAngularModule()) {
                    File origLoc = npmProj.loc
                    npmProj.loc = npmProj.getAngularModuleLinkDir(true)
                    npmProj.exec("npm link ${it}".toString())
                    npmProj.loc = origLoc
                }
            }
        }
    }

//    @Profile
    private void npmLinkToReact() {
        titlePrinter.printTitle("link react")
        projs.findAll({ it.reactApp }).each { NpmProj npmProj ->
            File reactModuleDir = projs.find { it.reactModule }.getReactModuleDir()
            titlePrinter.printSubTitle("Linking react module [${reactModuleDir.absoluteFile.absolutePath}]")
            npmProj.exec("npm link ${reactModuleDir.absoluteFile.absolutePath}".toString())
        }
    }

//    @Profile
    private void createLinks() {
        titlePrinter.printTitle("create links")
        projs.findAll({ it.doOthersLinkToMe }).each {
            File origLoc
            if (it.isAngularModule()) {
                titlePrinter.printTitle("install and build angular module")
                it.exec("npm install")
                it.exec("npm run build")
                origLoc = it.loc;
                it.loc = it.getAngularModuleLinkDir(true)
            }
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("ls")
            it.exec("node -v")
            it.exec("npm link")
            if (it.isAngularModule()) {
                it.loc = origLoc
            }
        }
    }
}

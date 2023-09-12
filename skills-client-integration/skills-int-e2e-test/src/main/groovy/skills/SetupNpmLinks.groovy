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

import groovy.util.logging.Slf4j

//import callStack.profiler.CProf
//import callStack.profiler.Profile

import java.nio.file.Files

@Slf4j
class SetupNpmLinks {

    // private
    TitlePrinter titlePrinter = new TitlePrinter()

    static void main(String[] args) {
        Integer targetNodeVersion = 0
        boolean shouldPrune = args.find({ it.equalsIgnoreCase("--prune") })
        if (args.length > 0) {
            targetNodeVersion = args[0].toInteger()
        }
        new SetupNpmLinks(shouldPrune: shouldPrune, targetNodeVersion: targetNodeVersion).init().doLink()
//        log.info("Execution Prof:\n{}", CProf.prettyPrint())
    }

    // configure
    File root = new File("./")
    boolean shouldPrune = false
    Integer targetNodeVersion = 14

    List<NpmProj> projs
    SetupNpmLinks init(){
        projs = new NpmProjBuilder(loc: root, targetNodeVersion: targetNodeVersion).build()
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
//        now that we have multiple versions of react being tested against, this doesn't make sense
//        npmLinkToReact()
        validateLinks()
        build()
    }

//    @Profile
    private void install() {
        titlePrinter.printTitle("install")
        projs.each { NpmProj npmProj ->
            if (!npmProj.isAngularModule()) {
                // angular modules were installed within createLinks()
                npmProj.exec("npm install --force")
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
//            now that we have multiple versions of react being tested against, this doesn't make sense
//            assert Files.isSymbolicLink(npmProj.getReactModuleDir().toPath())
        }
    }

//    @Profile
    private void npmLinkToSkills() {
        titlePrinter.printTitle("link")
        projs.findAll({ it.hasLinksToOtherProjects }).each { NpmProj npmProj ->
            npmProj.skillsDependenciesFromPackageJson.each {
                titlePrinter.printSubTitle("Linking module [${it}] in project [${npmProj}]")

                npmProj.exec("npm link --force ${it}".toString())
                if (npmProj.getAngularModule()) {
                    File origLoc = npmProj.loc
                    npmProj.loc = npmProj.getAngularModuleLinkDir(true)
                    npmProj.exec("npm link --force ${it}".toString())
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
            if (it.isAngularModule() || it.isAngularApp()) {
                titlePrinter.printTitle("install and build angular module")
                it.exec("npm install --force")
                it.exec("npm run build")
                origLoc = it.loc;
                it.loc = it.getAngularModuleLinkDir(true)
            }
            titlePrinter.printSubTitle("create link for ${it.loc.name}")
            it.exec("ls")
            it.exec("node -v")
            it.exec("npm link")
            if (it.isAngularModule() || it.isAngularApp()) {
                it.loc = origLoc
            }
        }
    }
}

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

@Slf4j
class RemoveNpmLinks {

    static void main(String[] args) {
        new RemoveNpmLinks().init().removeAnyExistingLinks()
//        log.info("Execution Prof:\n{}", CProf.prettyPrint())
    }

    File root = new File("./")
    TitlePrinter titlePrinter = new TitlePrinter()
    List<NpmProj> projs
    boolean npmInstall = true
    boolean shouldPrune = false


    RemoveNpmLinks init(){
        projs = new NpmProjBuilder(loc: root).build()
        return this
    }

//    @Profile
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
        }

        if (npmInstall){
            doNpmInstall()
        }
    }

//    @Profile
    private void doNpmInstall() {
        titlePrinter.printTitle("${(shouldPrune ? 'npm prune and ' : '')}npm install")
        projs.each {
            titlePrinter.printSubTitle("install ${(shouldPrune ? 'and prune ' : '')}${it.loc.name}")
            if (shouldPrune) {
                it.exec("npm prune")
            }
            it.exec("npm install")
        }
    }

}

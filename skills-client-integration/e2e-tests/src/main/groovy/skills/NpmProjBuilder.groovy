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

import callStack.profiler.Profile
import groovy.util.logging.Slf4j

@Slf4j
class NpmProjBuilder {

    boolean locate = true
    File loc = new File("./")

    private File locate(String name) {
        List<File> toCheck = [new File(loc, name), new File(loc, "skills-client-examples/$name"), new File(loc, "../$name"), new File(loc, "../../$name")]
        for (File f : toCheck) {
            if (f.exists()) {
                return f
            }
        }
        throw new IllegalArgumentException("Failed to locate [$name] project. Startring seach point [${loc.absoluteFile.absolutePath}]")
    }


    private List<NpmProj> projs = [
            new NpmProj(name: "skills-client-js", doOthersLinkToMe: true, hasLinksToOtherProjects: false),
            new NpmProj(name: "skills-client-vue", doOthersLinkToMe: true),
            new NpmProj(name: "skills-client-react", doOthersLinkToMe: true, reactModule: true),
            new NpmProj(name: "skills-example-client-js", doOthersLinkToMe: false),
            new NpmProj(name: "skills-example-client-vue", doOthersLinkToMe: false),
            new NpmProj(name: "skills-example-client-react", doOthersLinkToMe: false, reactApp: true),
    ]

    private void assertExist() {
        projs.each {
            assert it.loc.exists()
            assert it.loc.isDirectory()
            log.info("${it.loc.absolutePath} exists!")
        }
    }

    @Profile
    List<NpmProj> build() {
        if (locate) {
            for (NpmProj p : projs) {
                p.loc = locate(p.name)
            }
            assertExist()
        }
        return projs
    }

    List<NpmProjRel> buildRelMap() {
        List<NpmProjRel> finalRes = []
        List<NpmProj> resList = build()
        for (NpmProj from in resList.findAll({ it.hasLinksToOtherProjects })) {
            def packageJson = from.packageJson
            List<String> skillsProjs = packageJson.dependencies.findAll { it.key.toString().startsWith("@skills") }.collect { it.key }
            List<NpmProj> toProjs = skillsProjs.collect { String searchFor ->
                return resList.find({ searchFor.endsWith(it.loc.name) })
            }
            toProjs.each {
                finalRes << new NpmProjRel(from: from, to: it)
            }
        }

        return finalRes
    }
}

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
package skills.backwardsCompat

import groovy.json.JsonSlurper
import groovy.util.logging.Slf4j
import skills.TitlePrinter

@Slf4j
class BackwardCompatHelper {

    List<TestDeps> load(){
        File confJson = new File(getClass().getResource('/skills-service-backwards-compat-lib-versions.json').toURI())
        def versionConf = new JsonSlurper().parse(confJson)
        List<TestDeps> buildWithDeps = versionConf.collect { libItem ->
            String libName = libItem.key
            List<Deps> runWithDeps = libItem.value.collect { depsToUpdate ->
                List<Dep> deps = depsToUpdate.collect {
                    new Dep(name: it.dep, version: it.version)
                }
                new Deps(deps: deps, projName: libName)
            }

            new TestDeps(projName:libName, runWithDeps: runWithDeps)
        }

        new TitlePrinter().printTitle("Backwards Compatibility Plan")
        buildWithDeps.each {
            log.info("[{}] test with the following deps:", it.projName)
            it.runWithDeps.each { Deps deps ->
                log.info("     {}", deps.deps.collect({"${it.name}:${it.version}"}).join(", "))
            }
        }

        return buildWithDeps
    }
}

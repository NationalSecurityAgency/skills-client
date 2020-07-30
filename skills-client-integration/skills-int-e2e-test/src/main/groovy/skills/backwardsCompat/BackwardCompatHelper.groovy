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

    private List<String> projects = ["skills-client-js", "skills-client-vue", "skills-client-react"]

    List<DepToTest> load() {
        return projects.collect { String projName ->
            URL url = "https://registry.npmjs.org/@skilltree/${projName}".toURL()
            String text = url.text
            def clientJsInfo = new JsonSlurper().parseText(text)
            List<String> versions = clientJsInfo.versions.collect { it.key }.sort()
            return new DepToTest(name: projName, versions: versions.collect { new VersionToTest(version: it, projName: projName) })
        }
    }


}

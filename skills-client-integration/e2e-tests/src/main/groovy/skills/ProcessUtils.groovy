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

@Slf4j
class ProcessUtils {

    void killProcessIfContainsStr(String grepFor) {
        String output = new ProcessRunner(printOutput: false).run("ps -ef").sout
        if (output) {
            List<String> found = output.split("\n").findAll({ it.contains(grepFor) })
            if (found) {
                assert found.size() == 1
                log.info("Killing [${found.first()}]")
                String pid = found.first().split("\\s+")[1]
                assert pid
                new ProcessRunner().run("kill -9 ${pid}")

                while (found) {
                    found = new ProcessRunner(printOutput: false).run("ps -ef").sout.split("\n").findAll({ it.contains(grepFor) })
                    if (found) {
                        log.info("Waiting for ${found.first()} to die")
                        Thread.sleep(1000)
                    }
                }
            }
        }
    }
}

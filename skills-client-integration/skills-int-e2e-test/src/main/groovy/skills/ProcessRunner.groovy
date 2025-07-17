/*
Copyright 2025 SkillTree

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
import org.apache.commons.text.StringTokenizer
import org.apache.commons.text.matcher.StringMatcherFactory
import org.codehaus.groovy.runtime.ProcessGroovyMethods
import org.zeroturnaround.exec.stream.TeeOutputStream
import org.zeroturnaround.exec.stream.slf4j.Slf4jStream

import java.util.concurrent.TimeUnit

@Slf4j
class ProcessRunner {
    static class ProcessRes {
        String sout
        String serr
    }

    boolean dryRun = false
    boolean failWithErrMsg = false
    boolean printOutput = true
    boolean waitForOutput = true
//    OutputStream sout = new StringBuilder()
//    Appendable serr = new StringBuilder()
    File loc = new File("./")
    List env = []

    ProcessRes run(String cmd) {
        StringTokenizer st = new StringTokenizer(cmd)
        st.setQuoteMatcher(StringMatcherFactory.INSTANCE.quoteMatcher())
        this.run(st.tokenList)
    }

    ProcessRes run(List<String> cmd) {
        assert cmd
        assert loc

        ByteArrayOutputStream sout = new ByteArrayOutputStream();
        ByteArrayOutputStream serr = new ByteArrayOutputStream();

        String name = loc.name
        if (dryRun) {
            log.info("DRY RUN [${cmd}] in [${loc.absoluteFile.absolutePath}]${env ? " Custom ENV ${env}" : ""}")
            return new ProcessRes(serr: "", sout: "")
        } else {
            log.info("Executing: [${cmd}] in [$loc.absoluteFile.absolutePath]${env ? " Custom ENV ${env}" : ""}")
            Process p
            if (env) {
                p = ProcessGroovyMethods.execute(cmd, env, loc)
            } else {
                p = cmd.execute(null, loc)
            }

            if (waitForOutput) {
                if (printOutput) {
                    TeeOutputStream teeOutputStream = new TeeOutputStream(Slf4jStream.ofCaller().asInfo(), sout)
                    TeeOutputStream teeErrorStream = new TeeOutputStream(Slf4jStream.ofCaller().asError(), serr)
                    p.waitForProcessOutput(teeOutputStream, teeErrorStream)
                } else {
                    p.waitForProcessOutput(sout, serr)
                }
                p.waitFor(5, TimeUnit.MINUTES)

            } else {
                if (printOutput) {
                    TeeOutputStream teeOutputStream = new TeeOutputStream(Slf4jStream.ofCaller().asInfo(), sout)
                    TeeOutputStream teeErrorStream = new TeeOutputStream(Slf4jStream.ofCaller().asError(), serr)
                    p.consumeProcessOutput(teeOutputStream, teeErrorStream)
                } else {
                    p.consumeProcessOutput(sout, serr)
                }
                p.waitFor(5, TimeUnit.MINUTES)
            }

            String errMsg = serr ? new String(serr.toByteArray()) : ""
            String outMsg = sout ? new String(sout.toByteArray()) : ""
            if (waitForOutput && p.exitValue() != 0) {
                throw new IllegalStateException("[$name] - [${cmd}] failed with error code [${p.exitValue()}]:\nserr: ${errMsg}\nsout: ${outMsg}")
            }
            if (failWithErrMsg && errMsg) {
                throw new IllegalStateException("[$name] - [${cmd}] failed:\nserr: ${errMsg}\nsout: ${outMsg}")
            }
            return new ProcessRes(serr: errMsg, sout: sout ? new String(sout.toByteArray()) : "")
        }
    }
}

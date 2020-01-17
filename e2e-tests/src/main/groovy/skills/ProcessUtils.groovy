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

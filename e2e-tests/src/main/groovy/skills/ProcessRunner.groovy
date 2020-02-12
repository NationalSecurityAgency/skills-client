package skills

import groovy.util.logging.Slf4j
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

    ProcessRes run(String cmd) {
        assert cmd
        assert loc

        ByteArrayOutputStream sout = new ByteArrayOutputStream();
        ByteArrayOutputStream serr = new ByteArrayOutputStream();

        String name = loc.name
        if (dryRun) {
            log.info("DRY RUN [${cmd}] in [${loc.absoluteFile.absolutePath}]")
            return new ProcessRes(serr: "", sout: "")
        } else {
            log.info("Executing: [${cmd}] in [$loc.absoluteFile.absolutePath]")
            Process p = cmd.execute(null, loc)

            if (waitForOutput) {
                p.waitFor(5, TimeUnit.MINUTES)
                if (printOutput) {
                    TeeOutputStream teeOutputStream = new TeeOutputStream(Slf4jStream.ofCaller().asInfo(), sout)
                    TeeOutputStream teeErrorStream = new TeeOutputStream(Slf4jStream.ofCaller().asError(), serr)
                    p.waitForProcessOutput(teeOutputStream, teeErrorStream)
                } else {
                    p.waitForProcessOutput(sout, serr)
                }
            } else {
                if (printOutput) {
                    TeeOutputStream teeOutputStream = new TeeOutputStream(Slf4jStream.ofCaller().asInfo(), sout)
                    TeeOutputStream teeErrorStream = new TeeOutputStream(Slf4jStream.ofCaller().asError(), serr)
                    p.consumeProcessOutput(teeOutputStream, teeErrorStream)
                } else {
                    p.consumeProcessOutput(sout, serr)
                }
            }

            String errMsg = serr ? new String(serr.toByteArray()) : ""
            if (waitForOutput && p.exitValue() != 0) {
                throw new IllegalStateException("[$name] - [${cmd}] failed with error code [${p.exitValue()}]:\n${errMsg}")
            }
            if (failWithErrMsg && errMsg) {
                throw new IllegalStateException("[$name] - [${cmd}] failed:\n$errMsg")
            }
            return new ProcessRes(serr: errMsg, sout: sout ? new String(sout.toByteArray()) : "")
        }
    }
}

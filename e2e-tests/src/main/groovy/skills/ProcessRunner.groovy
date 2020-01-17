package skills

import groovy.util.logging.Slf4j
import org.zeroturnaround.exec.stream.TeeOutputStream
import org.zeroturnaround.exec.stream.slf4j.Slf4jStream

@Slf4j
class ProcessRunner {
    static class ProcessRes {
        String sout
        String serr
    }

    boolean dryRun = false
    boolean failWithErrMsg = true
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
            log.info("DRY RUN [${name}]: [${cmd}]")
            return new ProcessRes(serr: "", sout: "")
        } else {
            log.info("Executing: [${cmd}]")
            Process p = cmd.execute(null, loc)
            if (waitForOutput) {
                if (printOutput) {
                    TeeOutputStream teeOutputStream = new TeeOutputStream(Slf4jStream.ofCaller().asInfo(), sout)
                    TeeOutputStream teeErrorStream = new TeeOutputStream(Slf4jStream.ofCaller().asError(), serr)
                    p.waitForProcessOutput(teeOutputStream, teeErrorStream)
                } else {
                   p.waitForProcessOutput(sout, serr)
                }
            }

//            else {
//                p.getInputStream().transferTo(System.out)
//                p.getErrorStream().transferTo(System.err)
//            }
//            if (printOutput) {
//                log.info("Executed [$cmd]\n--- sout: ---\n${sout}\n---- serr: ---\n${serr}")
//            }
            String errMsg = serr ? new String(serr.toByteArray()) : ""
            if( waitForOutput && p.exitValue() != 0) {
                throw new IllegalStateException("[$name] - [${cmd}] failed with error code [${p.exitValue()}]:\n${errMsg}")
            }
            if (failWithErrMsg && errMsg) {
                throw new IllegalStateException("[$name] - [${cmd}] failed:\n$errMsg")
            }
            return new ProcessRes(serr: errMsg, sout: sout ? new String(sout.toByteArray()): "")
        }
    }
}

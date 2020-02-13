package skills

import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class DirHelper {

    static void createEmptyDirClearIfExist(File workDir) {
        if (workDir.exists()) {
            FileUtils.deleteDirectory(workDir)
            log.info("Removed [{}]", workDir.absoluteFile.absolutePath)
        }

        if (!workDir.exists()) {
            workDir.mkdirs()
            log.info("Created [{}]", workDir.absoluteFile.absolutePath)
        }
    }

}

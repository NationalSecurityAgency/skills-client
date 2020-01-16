package skills

import groovy.util.logging.Slf4j

@Slf4j
class TitlePrinter {
    void printTitle(String title) {
        log.info("\n------------------------------------------------------------\n" +
                "\n-------- $title --------\n" +
                "\n------------------------------------------------------------\n")
    }

    void  printSubTitle(String title) {
        log.info("\n------------------------------------------------------------\n" +
                "-- $title --\n" +
                "------------------------------------------------------------\n")
    }
}

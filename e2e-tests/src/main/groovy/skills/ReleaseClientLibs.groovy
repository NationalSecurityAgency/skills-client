package skills

import groovy.util.logging.Slf4j

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        new ReleaseClientLibs().doRelease()
    }

    TitlePrinter titlePrinter = new TitlePrinter()
    void doRelease(){
        titlePrinter.printTitle("Identify Dependencies")
        List<NpmProjRel> rels = new NpmProjBuilder(includeSkillsServiceFrontend: true).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }
    }

}

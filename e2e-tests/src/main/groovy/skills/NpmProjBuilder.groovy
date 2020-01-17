package skills

import groovy.util.logging.Slf4j

@Slf4j
class NpmProjBuilder {

    boolean assertExistence = true

    private File locate(String name) {
        List<File> toCheck = [new File(name), new File("../$name"), new File("../../$name")]
        for (File f : toCheck) {
            if (f.exists()) {
                return f
            }
        }
        throw new IllegalArgumentException("Failed to locate [$name] project")
    }

    private List<NpmProj> projs = [
            new NpmProj(loc: locate("skills-client-configuration"), doOthersLinkToMe: true, hasLinksToOtherProjects: false),
            new NpmProj(loc: locate("skills-client-reporter"), doOthersLinkToMe: true),
            new NpmProj(loc: locate("skills-client-js"), doOthersLinkToMe: true),
            new NpmProj(loc: locate("skills-client-vue"), doOthersLinkToMe: true),
            new NpmProj(loc: locate("skills-client-react"), doOthersLinkToMe: true),
            new NpmProj(loc: locate("skills-example-client-js"), doOthersLinkToMe: false),
            new NpmProj(loc: locate("skills-example-client-vue"), doOthersLinkToMe: false),
            new NpmProj(loc: locate("skills-example-client-react"), doOthersLinkToMe: false),
    ]

    private void assertExist(){
        projs.each {
            assert it.loc.exists()
            assert it.loc.isDirectory()
            log.info("${it.loc.absolutePath} exists!")
        }
    }

    List<NpmProj> build(){
        if (assertExistence){
            assertExist()
        }
        return projs
    }

    List<NpmProjRel> buildRelMap(){
        List<NpmProjRel> finalRes = []
        List<NpmProj> resList = build()
        for (NpmProj from in resList.findAll({ it.hasLinksToOtherProjects })) {
            def packageJson = from.packageJson
            List<String> skillsProjs = packageJson.dependencies.findAll { it.key.toString().startsWith("@skills") }.collect { it.key }
            List<NpmProj> toProjs = skillsProjs.collect { String searchFor ->
                return resList.find({searchFor.endsWith(it.loc.name)})
            }
            toProjs.each {
                finalRes << new NpmProjRel(from: from, to: it)
            }
        }

        return finalRes
    }
}

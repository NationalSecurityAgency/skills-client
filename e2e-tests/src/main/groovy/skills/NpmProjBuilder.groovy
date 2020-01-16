package skills

import groovy.util.logging.Slf4j

@Slf4j
class NpmProjBuilder {

    boolean includeSkillsServiceFrontend = false

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
            new NpmProj(loc: locate("skills-client-configuration"), linkTo: true, hasLinksToOtherProjects: false),
            new NpmProj(loc: locate("skills-client-reporter"), linkTo: true),
            new NpmProj(loc: locate("skills-client-js"), linkTo: true),
            new NpmProj(loc: locate("skills-client-vue"), linkTo: true),
            new NpmProj(loc: locate("skills-client-react"), linkTo: true),
            new NpmProj(loc: locate("skills-example-client-js"), linkTo: false),
            new NpmProj(loc: locate("skills-example-client-vue"), linkTo: false),
            new NpmProj(loc: locate("skills-example-client-react"), linkTo: false),
    ]

    private void assertExist(){
        if (includeSkillsServiceFrontend){
            projs << new NpmProj(loc: locate("skills-service/frontend"), linkTo: false)
        }
        projs.each {
            assert it.loc.exists()
            assert it.loc.isDirectory()
            log.info("${it.loc.absolutePath} exists!")
        }
    }

    List<NpmProj> build(){
        assertExist()
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

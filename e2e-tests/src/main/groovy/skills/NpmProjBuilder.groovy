package skills

import groovy.util.logging.Slf4j

@Slf4j
class NpmProjBuilder {

    boolean locate = true
    File loc = new File("./")

    private File locate(String name) {
        List<File> toCheck = [new File(loc, name), new File(loc, "../$name"), new File(loc, "../../$name")]
        for (File f : toCheck) {
            if (f.exists()) {
                return f
            }
        }
        throw new IllegalArgumentException("Failed to locate [$name] project")
    }


    private List<NpmProj> projs = [
            new NpmProj(name: "skills-client-configuration", doOthersLinkToMe: true, hasLinksToOtherProjects: false),
            new NpmProj(name: "skills-client-reporter", doOthersLinkToMe: true),
            new NpmProj(name: "skills-client-js", doOthersLinkToMe: true),
            new NpmProj(name: "skills-client-vue", doOthersLinkToMe: true),
            new NpmProj(name: "skills-client-react", doOthersLinkToMe: true),
            new NpmProj(name: "skills-example-client-js", doOthersLinkToMe: false),
            new NpmProj(name: "skills-example-client-vue", doOthersLinkToMe: false),
            new NpmProj(name: "skills-example-client-react", doOthersLinkToMe: false),
    ]

    private void assertExist() {
        projs.each {
            assert it.loc.exists()
            assert it.loc.isDirectory()
            log.info("${it.loc.absolutePath} exists!")
        }
    }

    List<NpmProj> build() {
        if (locate) {
            for (NpmProj p : projs) {
                p.loc = locate(p.name)
            }
            assertExist()
        }
        return projs
    }

    List<NpmProjRel> buildRelMap() {
        List<NpmProjRel> finalRes = []
        List<NpmProj> resList = build()
        for (NpmProj from in resList.findAll({ it.hasLinksToOtherProjects })) {
            def packageJson = from.packageJson
            List<String> skillsProjs = packageJson.dependencies.findAll { it.key.toString().startsWith("@skills") }.collect { it.key }
            List<NpmProj> toProjs = skillsProjs.collect { String searchFor ->
                return resList.find({ searchFor.endsWith(it.loc.name) })
            }
            toProjs.each {
                finalRes << new NpmProjRel(from: from, to: it)
            }
        }

        return finalRes
    }
}

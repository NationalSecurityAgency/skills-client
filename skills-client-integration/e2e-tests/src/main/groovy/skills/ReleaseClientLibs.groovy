/*
Copyright 2020 SkillTree

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

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        String releaseTypeParam = args.find({ it.startsWith("-releaseType=") })
        assert releaseTypeParam, "Must provide releaseType=${ReleaseType.values().collect({ it.name() }).join("|")}"
        String releaseTypeStr = releaseTypeParam.split("-releaseType=")[1]
        assert ReleaseType.values().find({ it.name() == releaseTypeStr }), "Must provide releaseType=${ReleaseType.values().collect({ it.name() }).join("|")}"
        ReleaseType releaseType = ReleaseType.valueOf(releaseTypeStr)
        Boolean notDryRun = args.find({ it.equalsIgnoreCase("-notDryRun") })

        new ReleaseClientLibs(releaseType: releaseType, dryRun: !notDryRun).release()
    }

    enum ReleaseType { patch, minor, major, prepatch, preminor, premajor}
    ReleaseType releaseType
    File workDir = new File("./e2e-tests/target/${ReleaseClientLibs.simpleName}/")
    TitlePrinter titlePrinter = new TitlePrinter()
    boolean dryRun = true

    void release(){
        titlePrinter.printTitle("Release Client Libs: Release type=[${releaseType}]")
        DirHelper.createEmptyDirClearIfExist(workDir)

        ProjectsOps npmProjects = new ProjectsOps(workDir: workDir)
        npmProjects.checkoutLinkedNpmLibs()

        List<NpmProjRel> rels = new NpmProjBuilder(loc: workDir).buildRelMap()
        rels.each {
            log.info("${it.from.name} (${it.from.version}) => ${it.to.name} (${it.to.version})")
        }

        for (NpmProj proj in npmProjects.allProj.findAll({ it.doOthersLinkToMe })) {
            titlePrinter.printTitle("Release for ${proj.name}")
            if (proj.hasUnreleasedChanges()) {
                log.info("${proj.name} has changes let's release")
                proj.exec("npm prune", dryRun)
                proj.exec("npm install", dryRun)
                proj.exec("npm run build", dryRun)
                proj.exec("release-it --ci ${releaseType}", dryRun)

            } else {
                log.info("${proj.name} has no changes. Release is not needed!")
            }

            List<NpmProjRel> updateVersion = rels.findAll({ it.to.name == proj.name })
            for (NpmProjRel updateRel in updateVersion) {
                String fromVersion = updateRel.from.getDepVersion("@skills/${updateRel.to.name}");
                if (!fromVersion.equalsIgnoreCase(updateRel.to.version)) {
                    log.info("  Update version for [${updateRel.from.name}]: ${updateRel.to.name} [${fromVersion}] -> [${updateRel.to.version}]")
                    updateRel.from.exec("npm install --save-exact @skills/${updateRel.to.name}@${updateRel.to.version}", dryRun)
                    updateRel.from.exec("git commit -a -m incrementing", dryRun)
                    updateRel.from.exec("git push", dryRun)
                } else {
                    log.info("   [${updateRel.from.name}]: is already up-to-date with version ${updateRel.to.name}:${updateRel.to.version}")
                }
            }
        }

        titlePrinter.printTitle("ALL DONE!")
    }
}

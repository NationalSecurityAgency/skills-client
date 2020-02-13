package skills

import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils

@Slf4j
class ReleaseService {

    static void main(String[] args) {
        if (!args){
            println "Usage with Dry Run: -releaseMode=Major|Minor|Patch -proj=UserInfoService|SkillsService"
            println "Usage: -releaseMode=Major|Minor|Patch -proj=UserInfoService|SkillsService -notDryRun"
            System.exit(-1)
        }
        String releaseModeStr = args.find({ it.startsWith("-releaseMode=") })
        assert releaseModeStr, "Must provide -releaseMode=${ReleaseMode.values().collect { it.name() }.join("|")}"
        ReleaseMode releaseMode = ReleaseMode.valueOf(releaseModeStr.split("-releaseMode=")[1])
        Boolean notDryRun = args.find({ it.equalsIgnoreCase("-notDryRun") })

        String projNameStr = args.find({ it.startsWith("-proj=") })
        assert projNameStr, "Must provide -proj=${SupportedProjects.values().collect { it.name() }.join("|")}"
        SupportedProjects proj = SupportedProjects.valueOf(projNameStr.split("-proj=")[1])

        String patchBranch = "master"
        if (releaseMode == ReleaseMode.Patch){
            String patchBranchParam = args.find({ it.startsWith("-patchBranch=") })
            assert patchBranchParam, "Must provide -patchBranch param when using -releaseMode=Patch"
            patchBranch = patchBranchParam.split("-patchBranch=")[1]
        }



        new ReleaseService(releaseMode: releaseMode, dryRun: !notDryRun, proj: proj, baseBranch: patchBranch).release()
    }

    ReleaseMode releaseMode
    String baseBranch = "master"
    boolean dryRun = true
    File workDir = new File("./e2e-tests/target/${this.class.name}/")
    String nexusHost = "http://ip-10-113-80-244.evoforge.org"
    SupportedProjects proj
    String optionalSubjProject = "backend"

    enum ReleaseMode {
        Major, Minor, Patch
    }

    enum SupportedProjects {
        SkillsService("skills-service"), UserInfoService("user-info-service");

        String name

        SupportedProjects(String name) {
            this.name = name;
        }
    }
    // private
    TitlePrinter titlePrinter = new TitlePrinter()

    void release() {
        String projName = proj.name
        titlePrinter.printTitle("Let's release. Project=[${projName}], Release Mode=[${releaseMode}], Dry Run=[${dryRun}]")
        log.info("Project name [${projName}]")
        if (workDir.exists()) {
            FileUtils.deleteDirectory(workDir)
            log.info("Removed [{}]", workDir.absoluteFile.absolutePath)
        }

        if (!workDir.exists()) {
            workDir.mkdirs()
            log.info("Created [{}]", workDir.absoluteFile.absolutePath)
        }


        new ProcessRunner(loc: workDir).run("git clone git@gitlab.evoforge.org:skills/${projName}.git")
        File projRootDir = new File(workDir, projName)
        assert projRootDir.exists()
        // if patch then move to its the branch
        if (releaseMode == ReleaseMode.Patch) {
            new ProcessRunner(loc: projRootDir).run("git checkout ${baseBranch}")
        }
        String releaseVersion = getReleaseVersion(projRootDir)
        validateNoTag(projRootDir, releaseVersion)

        // if major or minor version then create a branch, so it's ready for future patches
        boolean createBranch = [ReleaseMode.Major, ReleaseMode.Minor].contains(releaseMode)
        String branchName = releaseVersion.split("\\.").toList().subList(0, 2).join(".") + ".X"
        if (createBranch) {
            validateNoBranch(projRootDir, branchName)
        }

        String nextSnapshotVersion = nextMinorSnapshotVersion(releaseVersion, releaseMode)

        log.info("Base branch name: [{}]", baseBranch)
        log.info("Next snapshot version: [{}]", nextSnapshotVersion)



        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("mvn versions:set -DnewVersion=${releaseVersion}")

        log.info("---- Build and upload jar ----")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("mvn --batch-mode package -DskipTests")
        File jar
        if (optionalSubjProject) {
            jar = new File(projRootDir, "${optionalSubjProject}/target").listFiles().find { it.name.startsWith(optionalSubjProject) && it.name.endsWith(".jar") }
        } else {
            jar = new File(projRootDir, "target").listFiles().find { it.name.startsWith(projName) && it.name.endsWith(".jar") }
        }
        if (!dryRun) {
            assert jar
        }
        log.info("---- Finished Building Jar ----")
        // account for dry run
        String jarFilePath = jar?.absoluteFile?.absolutePath
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("mvn --batch-mode deploy:deploy-file -DpomFile=${optionalSubjProject ? "$optionalSubjProject/" : ""}pom.xml -Dfile=${jarFilePath} -Durl=${nexusHost}/repository/maven-releases/ -DrepositoryId=nexus-releases")
        log.info("---- Finished Uploading Jar ----")

        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git commit -m \"creating release version ${releaseVersion}\"")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git tag -a ${releaseVersion} -m \"tag release version ${releaseVersion}\"")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push origin ${releaseVersion}")

        if (createBranch) {
            titlePrinter.printSubTitle("Creating branch [${branchName}] for future patch work")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git checkout -b ${branchName}")

            String branchSnapshot = incrementVersion(releaseVersion, ReleaseMode.Patch) + "-SNAPSHOT"
            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("mvn versions:set -DnewVersion=${branchSnapshot}")

            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git commit -m \"creating patch branch [${branchSnapshot}]\"")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push -u origin ${branchName}")


            titlePrinter.printSubTitle("Reset our base branch [${baseBranch}] for the next version")
            new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git checkout ${baseBranch}")
        }


        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("mvn versions:set -DnewVersion=${nextSnapshotVersion}")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git commit -m \"prep master for the next dev version [${nextSnapshotVersion}]\"")
        new ProcessRunner(loc: projRootDir, dryRun: dryRun).run("git push")

        titlePrinter.printTitle('ALL DONE')
    }

    private void validateNoTag(File projRootDir, String tag) {
        String res = new ProcessRunner(loc: projRootDir, printOutput: false).run("git tag").sout
        assert !res.split("\n").find({ it.equalsIgnoreCase(tag) }), "There is already ${tag} tag"
    }

    private void validateNoBranch(File projRootDir, String branch) {
        String res = new ProcessRunner(loc: projRootDir, printOutput: false).run("git branch -a").sout
        assert !res.split("\n").find({ it.contains(branch) }), "There is already ${branch} branch"
    }


    private String getReleaseVersion(File skillsService) {
        File pom = new File(skillsService, "pom.xml")
        def slurpedPom = new XmlSlurper().parse(pom)
        String version = slurpedPom.version
        log.info("Current version is [{}]", version)
        assert version.endsWith("SNAPSHOT")
        String newVersion = version.split("-SNAPSHOT")[0]
        log.info("Release version is [{}]", newVersion)
        return newVersion
    }

    private String incrementVersion(String version, ReleaseMode modeToUse) {
        String[] versionSlit = version.split("\\.")
        assert versionSlit.size() == 3
        switch (modeToUse) {
            case ReleaseMode.Major:
                versionSlit[0] = increment(versionSlit[0])
                break;
            case ReleaseMode.Minor:
                versionSlit[1] = increment(versionSlit[1])
                break;
            case ReleaseMode.Patch:
                versionSlit[2] = increment(versionSlit[2])
                break;
        }
        String newVersion = versionSlit.join(".")
        return newVersion
    }

    private String nextMinorSnapshotVersion(String version, ReleaseMode modeToUse) {
        String[] versionSlit = version.split("\\.")
        assert versionSlit.size() == 3
        switch (modeToUse) {
            case ReleaseMode.Major:
                versionSlit[0] = increment(versionSlit[0])
                versionSlit[1] = 0
                versionSlit[2] = 0
                break;
            case ReleaseMode.Minor:
                versionSlit[1] = increment(versionSlit[1])
                versionSlit[2] = 0
                break;
            case ReleaseMode.Patch:
                versionSlit[2] = increment(versionSlit[2])
                break;
        }

        String newVersion = versionSlit.join(".")
        return newVersion + "-SNAPSHOT"
    }

    private String increment(String version) {
        (Integer.parseInt(version) + 1).toString()
    }
}

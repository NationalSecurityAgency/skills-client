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
package skills.helpers

class ScriptParamsHelper {
    String[] args

    static enum ReleaseMode {
        Major, Minor, Patch
    }

    File getWorkingDir() {
        String workDirStr = args.find({ it.startsWith("-workDir=") })
        assert workDirStr, "Must provide -workDir="
        File workDir = new File(workDirStr.split("-workDir=")[1])
        assert workDir.exists(), "Work directory [${workDir.absolutePath}] must exist"
        assert workDir.isDirectory()
        assert workDir.listFiles().size() == 0, "Work directory [${workDir.absolutePath}] must be empty"
        return workDir
    }

    ReleaseMode getReleaseMode() {
        String releaseModeStr = args.find({ it.startsWith("-releaseMode=") })
        assert releaseModeStr, "Must provide -releaseMode=${ReleaseServiceMode.values().collect { it.name() }.join("|")}"
        ReleaseMode releaseMode = ReleaseMode.valueOf(releaseModeStr.split("-releaseMode=")[1])
        return releaseMode
    }

    boolean getNotDryRun() {
        Boolean notDryRun = args.find({ it.equalsIgnoreCase("-notDryRun") })
        return notDryRun
    }

    String getPatchBranch() {
        String patchBranchParam = args.find({ it.startsWith("-patchBranch=") })
        assert patchBranchParam, "Must provide -patchBranch param when using -releaseMode=Patch"
        String patchBranch = patchBranchParam.split("-patchBranch=")[1]
        return patchBranch
    }

    boolean getRunLocalButNoPushToRemove() {
        boolean runLocalButNoPushToRemote = args.find({ it.startsWith("-runLocalButNoPushToRemote") })
        if (getNotDryRun()) {
            assert !runLocalButNoPushToRemote
        }
        return runLocalButNoPushToRemote
    }
}

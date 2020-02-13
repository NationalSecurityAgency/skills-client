package skills

import groovy.util.logging.Slf4j

@Slf4j
class ReleaseClientLibs {

    static void main(String[] args) {
        String releaseTypeParam = args.find({ it.startsWith("releaseType=") })
        String releaseTypeStr = releaseTypeParam.split("releaseType=")[1]
        assert ReleaseType.values().find({ it.name() == releaseTypeStr }), "Must provide releaseType=${ReleaseType.values().collect({ it.name() }).join("|")}"
        ReleaseType releaseType = ReleaseType.valueOf(releaseTypeStr)
//        assert supportedReleaseTypes.contains(releaseType),  "Must provide releaseType=${supportedReleaseTypes.join("|")}"

//        new TestClientLibsBackwardsCompat(typeOfRelease: releaseType).doRelease()
    }

    enum ReleaseType { patch, minor, major, prepatch, preminor, premajor}
    ReleaseType releaseType
}

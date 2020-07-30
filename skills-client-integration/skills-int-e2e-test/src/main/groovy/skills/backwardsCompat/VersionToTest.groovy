package skills.backwardsCompat

import groovy.transform.ToString

@ToString(includeNames = true)
class VersionToTest {
    String projName
    String version
    boolean tested = false

    String depName(){
        return "@skilltree/${projName}"
    }
}

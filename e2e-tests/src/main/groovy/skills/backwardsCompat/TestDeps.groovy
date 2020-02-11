package skills.backwardsCompat

import groovy.transform.ToString

@ToString(includeNames = true)
class TestDeps {
    String projName
    List<Deps> runWithDeps
}

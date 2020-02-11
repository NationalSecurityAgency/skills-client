package skills.backwardsCompat

import groovy.transform.ToString

@ToString(includeNames = true)
class Deps {
    String uuid = UUID.randomUUID().toString()
    List<Dep> deps
    String projName
}

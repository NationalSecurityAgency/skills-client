package skills.backwardsCompat

import groovy.transform.ToString

import java.util.concurrent.atomic.AtomicInteger

@ToString(includeNames = true)
class TestRun {
    static AtomicInteger runFactory = new AtomicInteger(0)
    List<VersionToTest> versions
    int runNum = runFactory.getAndIncrement()
}

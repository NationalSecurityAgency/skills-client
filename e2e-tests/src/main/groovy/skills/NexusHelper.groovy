package skills

class NexusHelper {

    List<String> getSnapshotVersions() {
        def url = "http://ip-10-113-80-244.evoforge.org/repository/maven-snapshots/skills/backend/maven-metadata.xml".toURL()
        String xmlContent = url.text
        def slurped = new XmlSlurper().parseText(xmlContent)
        List<String> res = slurped.versioning.versions.children().collect { it.text() }
        return res
    }

    String getLatestSnapVersion(){
        getSnapshotVersions().sort().last()
    }
}

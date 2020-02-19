package skills

class NexusHelper {

    String nexusUrl = "http://ip-10-113-80-244.evoforge.org"
    String project = "backend"

    List<String> getSnapshotVersions() {
        def url = "${nexusUrl}/repository/maven-snapshots/skills/${project}/maven-metadata.xml".toURL()
        return parseFromXML(url)
    }

    List<String> getReleaseVersions() {
        def url = "${nexusUrl}/repository/maven-releases/skills/${project}/maven-metadata.xml".toURL()
        return parseFromXML(url)
    }

    /**
     *
     * @param start - start version, for example 1.1
     * @return
     */
    List<String> getReleaseVersionsStaringWith(String start) {
        List<String> res = new NexusHelper().releaseVersions

        assert start.split("\\.").size() == 2
        List<Integer> minVersions = start.split("\\.").collect({ Integer.parseInt(it) })
        // support starts with 1.1
        List<String> supported = res.findAll {
            String[] split = it.split("\\.")
            List<Integer> versionBits = split.collect { Integer.parseInt(it) }
            boolean supported = versionBits[0] > minVersions[0] || (versionBits[0] == minVersions[0] && versionBits[1] >= minVersions[1])
            return supported
        }
        return supported
    }

    private List<String> parseFromXML(URL url) {
        String xmlContent = url.text
        def slurped = new XmlSlurper().parseText(xmlContent)
        List<String> res = slurped.versioning.versions.children().collect { it.text() }

        return res
    }


    String getLatestSnapVersion() {
        getSnapshotVersions().sort().last()
    }
}

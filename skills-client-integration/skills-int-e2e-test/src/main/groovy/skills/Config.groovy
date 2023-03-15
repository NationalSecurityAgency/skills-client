package skills

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix="skills")
class Config {

    List<VersionProps> versionProps

    static class VersionProps {
        String version
        String altJavaHomeEnv
    }

}

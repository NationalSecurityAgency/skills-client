package skills.example;

import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class SecretsUtil {
    static final String KS_PW_FILE_KEY = "skills.keystore.password.file";
    static final String KS_CLIENT_PW_PROP_KEY = "javax.net.ssl.keyStorePassword";
    static final String KS_SERVER_PW_PROP_KEY = "server.ssl.key-store-password";

    static final String TS_PW_FILE_KEY = "skills.truststore.password.file";
    static final String TS_CLIENT_PW_PROP_KEY = "javax.net.ssl.trustStorePassword";
    static final String TS_SERVER_PW_PROP_KEY = "server.ssl.trust-store-password";
    public void updateSecrets() {
        System.out.println("Checking for external secrets...");

        String ksPasswordFile = System.getProperty(KS_PW_FILE_KEY);
        if (StringUtils.hasText(ksPasswordFile)) {
            System.out.println("Setting keystore password using file [" + ksPasswordFile + "]");
            System.setProperty(KS_CLIENT_PW_PROP_KEY, getTextFromFile(ksPasswordFile));
            System.setProperty(KS_SERVER_PW_PROP_KEY, getTextFromFile(ksPasswordFile));
        }


        String tsPasswordFile = System.getProperty(TS_PW_FILE_KEY);
        if (StringUtils.hasText(tsPasswordFile)) {
            System.out.println("Setting keystore password using file [" + tsPasswordFile + "]");
            System.setProperty(TS_CLIENT_PW_PROP_KEY, getTextFromFile(tsPasswordFile));
            System.setProperty(TS_SERVER_PW_PROP_KEY, getTextFromFile(tsPasswordFile));
        }

    }

    private String getTextFromFile(String filename) {
        try {
            return new String(Files.readAllBytes(Paths.get(filename)), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

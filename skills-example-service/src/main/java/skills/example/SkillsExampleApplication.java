package skills.example;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.net.ssl.HttpsURLConnection;

@SpringBootApplication
public class SkillsExampleApplication {

	static final String DISABLE_HOSTNAME_VERIFIER_PROP = "skills.disableHostnameVerifier";

	public static void main(String[] args) {
		boolean disableHostnameVerifier = Boolean.parseBoolean(System.getProperty(DISABLE_HOSTNAME_VERIFIER_PROP));
		if (disableHostnameVerifier) {
			HttpsURLConnection.setDefaultHostnameVerifier((s, sslSession) -> true);
		}

		SpringApplication.run(SkillsExampleApplication.class, args);
	}

	@Component
	@ConfigurationProperties("skills.service")
	public static class SkillsConfig {
		String serviceUrl;
		String projectId;
		String authenticator;
		@JsonIgnore
		String username;
		@JsonIgnore
		String password;
		@JsonIgnore
		String authMode = "token";

		public String getServiceUrl() { return serviceUrl; }
		public String getProjectId() { return projectId; }
		public String getAuthenticator() { return authenticator; }
		public String getUsername() { return username; }
		public String getPassword() { return password; }
		public String getAuthMode() { return authMode; }

		public void setServiceUrl(String serviceUrl) { this.serviceUrl = serviceUrl; }
		public void setProjectId(String projectId) { this.projectId = projectId; }
		public void setAuthenticator(String authenticator) { this.authenticator = authenticator; }
		public void setUsername(String username) { this.username = username; }
		public void setPassword(String password) { this.password = password; }
		public void setAuthMode(String authMode) { this.authMode = authMode; }
	}
}

package skills.example;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@SpringBootApplication
public class SkillsExampleApplication {

	public static void main(String[] args) {
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

		public String getServiceUrl() { return serviceUrl; }
		public String getProjectId() { return projectId; }
		public String getAuthenticator() { return authenticator; }
		public String getUsername() { return username; }
		public String getPassword() { return password; }

		public void setServiceUrl(String serviceUrl) { this.serviceUrl = serviceUrl; }
		public void setProjectId(String projectId) { this.projectId = projectId; }
		public void setAuthenticator(String authenticator) { this.authenticator = authenticator; }
		public void setUsername(String username) { this.username = username; }
		public void setPassword(String password) { this.password = password; }
	}
}

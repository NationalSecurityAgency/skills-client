/**
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package skills.example;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import javax.net.ssl.HttpsURLConnection;

@SpringBootApplication
public class SkillsExampleApplication implements WebMvcConfigurer {

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

/**
 * Copyright 2025 SkillTree
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import skills.example.SkillsExampleApplication.SkillsConfig;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class Controller {

    @Autowired
    SkillsConfig skillsConfig;

    RestTemplate restTemplate;

    public Controller(RestTemplateBuilder restTemplateBuilder) {
        // RestTemplateBuilder will utilize the SecurityRestTemplateCustomizer, which
        // will configure HttpComponentsClientHttpRequestFactory as SpringTemplate does
        // not by default keeps track of session
        restTemplate = restTemplateBuilder.build();
    }

    @CrossOrigin()
    @GetMapping("/users/{user}/token")
    public String getUserAuthToken1(@PathVariable String user, @RequestHeader(value="Authorization",required=false) String existingToken) {
        String clientId =skillsConfig.getProjectId();
        String serviceTokenUrl = skillsConfig.getServiceUrl() + "/oauth/token";
        String clientSecret = getSecret(skillsConfig.getProjectId());

        RestTemplate oAuthRestTemplate = new RestTemplate();
        oAuthRestTemplate.setInterceptors(Arrays.asList(new BasicAuthenticationInterceptor(clientId, clientSecret)));
        HttpHeaders headers = new HttpHeaders();
        if (!StringUtils.isEmpty(existingToken)) {
            headers.set("Authorization", existingToken);
        }
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("proxy_user", user);

        ResponseEntity<String> responseEntity = oAuthRestTemplate.postForEntity(serviceTokenUrl, new HttpEntity<>(body, headers), String.class);

        return responseEntity.getBody();
    }

    @CrossOrigin()
    @GetMapping("/users/{projectId}/{user}/token")
    public String getUserAuthTokenWithProject(@PathVariable String projectId, @PathVariable String user, @RequestHeader(value="Authorization",required=false) String existingToken) {
        String clientId = projectId;
        String serviceTokenUrl = skillsConfig.getServiceUrl() + "/oauth/token";
        String clientSecret = getSecret(clientId);

        RestTemplate oAuthRestTemplate = new RestTemplate();
        oAuthRestTemplate.setInterceptors(Arrays.asList(new BasicAuthenticationInterceptor(clientId, clientSecret)));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        if (!StringUtils.isEmpty(existingToken)) {
            headers.set("Authorization", existingToken);
        }

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("proxy_user", user);

        ResponseEntity<String> responseEntity = oAuthRestTemplate.postForEntity(serviceTokenUrl, new HttpEntity<>(body, headers), String.class);

        return responseEntity.getBody();
    }

    @GetMapping("/skills")
    List<String> getAvailableSkillIds() throws Exception{
        String skillsUrl = skillsConfig.getServiceUrl() + "/admin/projects/" + skillsConfig.getProjectId() + "/skills";
        authIfNecessary();
        ResponseEntity<String> responseEntity = restTemplate.getForEntity(skillsUrl, String.class);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode topLevelTree = objectMapper.readTree(responseEntity.getBody());
        List<String> res = new ArrayList<>();
        for (JsonNode skillNode : topLevelTree) {
            String skillId = skillNode.get("skillId").asText();
            res.add(skillId);
        }
        System.out.println(responseEntity.getBody());
        return res;
    }

    @GetMapping("/config")
    SkillsConfig skillsConfig() {
        return skillsConfig;
    }

    private String getSecret(String projectId) {
        String secretUrl = skillsConfig.getServiceUrl() + "/admin/projects/" + projectId + "/clientSecret";
        authIfNecessary();
        ResponseEntity<String> responseEntity = restTemplate.getForEntity(secretUrl, String.class);
        String secret = responseEntity.getBody();
        System.out.println("got secret ["+secret+"] for clientId ["+projectId+"]");
        return secret;
    }

    private void authIfNecessary() {
        if (!skillsConfig.getAuthMode().equalsIgnoreCase("pki")) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("username", skillsConfig.getUsername());
            params.add("password", skillsConfig.getPassword());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(skillsConfig.getServiceUrl() + "/performLogin", request, String.class);
            assert response.getStatusCode() == HttpStatus.OK;
        }
    }

}

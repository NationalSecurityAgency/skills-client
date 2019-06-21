package skills.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.client.HttpClient;
import org.apache.http.conn.ssl.AllowAllHostnameVerifier;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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

    @CrossOrigin()
    @GetMapping("/users/{user}/token")
    public String getUserAuthToken1(@PathVariable String user) {
        String clientId =skillsConfig.getProjectId();
        String serviceTokenUrl = skillsConfig.getServiceUrl() + "/oauth/token";
        String clientSecret = getSecret();

        RestTemplate oAuthRestTemplate = new RestTemplate();
        oAuthRestTemplate.setInterceptors(Arrays.asList(new BasicAuthenticationInterceptor(clientId, clientSecret)));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("proxy_user", user);

        ResponseEntity<String> responseEntity = oAuthRestTemplate.postForEntity(serviceTokenUrl, new HttpEntity<>(body, headers), String.class);

        return responseEntity.getBody();
    }

    @GetMapping("/skills")
    List<String> getAvailableSkillIds() throws Exception{
        String skillsUrl = skillsConfig.getServiceUrl() + "/admin/projects/" + skillsConfig.getProjectId() + "/skills";
        RestTemplate restTemplate = getTemplateWithAuth();
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

    private String getSecret() {
        String secretUrl = skillsConfig.getServiceUrl() + "/admin/projects/" + skillsConfig.getProjectId() + "/clientSecret";
        RestTemplate restTemplate = getTemplateWithAuth();
        ResponseEntity<String> responseEntity = restTemplate.getForEntity(secretUrl, String.class);
        return responseEntity.getBody();
    }

    private RestTemplate getTemplateWithAuth() {
        RestTemplate restTemplate = new RestTemplate();
        if (!skillsConfig.getAuthMode().equalsIgnoreCase("pki")) {
            // must configure HttpComponentsClientHttpRequestFactory as SpringTemplate does
            // not by default keeps track of session
            restTemplate.setRequestFactory(getHttpRequestFactory());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("username", skillsConfig.getUsername());
            params.add("password", skillsConfig.getPassword());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(skillsConfig.getServiceUrl() + "/performLogin", request, String.class);
            assert response.getStatusCode() == HttpStatus.OK;
        }
        return restTemplate;
    }

    private ClientHttpRequestFactory getHttpRequestFactory() {
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        HttpClient httpClient = HttpClientBuilder.create().setSSLHostnameVerifier(new AllowAllHostnameVerifier()).build();
        clientHttpRequestFactory.setHttpClient(httpClient);
        return clientHttpRequestFactory;
    }

}

package skills.example;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.*;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;

@RestController
@RequestMapping("/api")
public class Controller {

//    @CrossOrigin(origins = "http://localhost:8091")
    @GetMapping("/users/{user}/token")
    public OAuth2Response getUserAuthToken(@PathVariable String user) {
        String serviceTokenUrl = "http://localhost:8080/oauth/token";
        String clientId = "movies";
        String clientSecret = "V1qUZ1y9P5Hkn75bCc4P5TQt00ABcBb6";

        RestTemplate oAuthRestTemplate = new RestTemplate();
        oAuthRestTemplate.setInterceptors(Arrays.asList(new BasicAuthenticationInterceptor(clientId, clientSecret)));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");
        body.add("proxy_user", user);

        ResponseEntity<OAuth2Response> responseEntity = oAuthRestTemplate.postForEntity(serviceTokenUrl, new HttpEntity<>(body, headers), OAuth2Response.class);

        return responseEntity.getBody();
    }

//    @CrossOrigin(origins = "http://localhost:8091")
    @GetMapping("/users/{user}/token1")
    public String getUserAuthToken1(@PathVariable String user) {
        String serviceTokenUrl = "http://localhost:8080/oauth/token";
        String clientId = "movies";
        String clientSecret = "V1qUZ1y9P5Hkn75bCc4P5TQt00ABcBb6";

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

    static class OAuth2Response {
        @JsonProperty("access_token")
        String accessToken;
        @JsonProperty("token_type")
        String tokenType;
        @JsonProperty("expires_in")
        Long expiresIn;
        String scope;
        @JsonProperty("proxy_user")
        String proxyUser;
        String jti;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
    }
}

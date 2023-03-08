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

import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManager;
import org.apache.hc.client5.http.socket.ConnectionSocketFactory;
import org.apache.hc.client5.http.socket.PlainConnectionSocketFactory;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactory;
import org.apache.hc.core5.http.config.RegistryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.SSLContexts;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;

@Component
public class SecurityRestTemplateCustomizer implements RestTemplateCustomizer {

    @Autowired
    SkillsExampleApplication.SkillsConfig skillsConfig;

    @Override
    public void customize(RestTemplate restTemplate) {
        // must configure HttpComponentsClientHttpRequestFactory as SpringTemplate does
        // not by default keeps track of session.  This method is called by the
        // RestTemplateBuilder used in the skills.example.Controller constructor
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory();
        HttpClient client = getHttpClient();
        clientHttpRequestFactory.setHttpClient(client);
        restTemplate.setRequestFactory(clientHttpRequestFactory);
    }

    private HttpClient getHttpClient() {
        try {
            TrustStrategy acceptAll = (cert, authType) -> true;
            SSLContextBuilder builder = SSLContexts.custom();
            SSLContext sslContext = builder.loadTrustMaterial(null, acceptAll).build();
            HostnameVerifier allowAllHosts = new NoopHostnameVerifier();
            SSLConnectionSocketFactory sslConnectionSocketFactory = new SSLConnectionSocketFactory(
                    sslContext,
                    new String[]{"TLSv1.2"},
                    null,
                    allowAllHosts);

            PoolingHttpClientConnectionManager poolingHttpClientConnectionManager =
                    new PoolingHttpClientConnectionManager(RegistryBuilder.<ConnectionSocketFactory>create()
                            .register("http", PlainConnectionSocketFactory.getSocketFactory())
                            .register("https", sslConnectionSocketFactory).build());

            return HttpClients.custom()
                    .useSystemProperties()
                    .setConnectionManager(poolingHttpClientConnectionManager)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

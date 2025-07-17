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
package skills.example.filters;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(SecurityProperties.DEFAULT_FILTER_ORDER-1)
public class VueEntryPointFilter implements Filter {
    @Autowired
    private VueEntryPointFilterUtils vueEntryPointFilterUtils;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        String requestUri = httpServletRequest.getRequestURI();
        if (vueEntryPointFilterUtils.isFrontendResource(requestUri)) {
            // frontend resource, forward to the UI for vue-js to handle
            String targetUri = requestUri;
            if (isVueEntryPoint(requestUri)) {
                targetUri = "/vuejs/index.html";
            }
            if (isAngularEntryPoint(requestUri)) {
                targetUri = "/angular/index.html";
            }
            httpServletRequest.getRequestDispatcher(targetUri).forward(request, response);
        } else {
            // backend resource, continue with the filter chain
            filterChain.doFilter(request, response);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException { }

    @Override
    public void destroy() { }

    private boolean isVueEntryPoint(String requestUri) {
        return requestUri.replaceAll("\\/", "").equals("vuejs");
    }
    private boolean isAngularEntryPoint(String requestUri) {
        return requestUri.contains("/angular/reportSkills") || requestUri.contains("/angular/showSkills");
    }
}

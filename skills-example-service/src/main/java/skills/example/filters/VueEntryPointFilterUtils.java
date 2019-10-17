package skills.example.filters;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
public class VueEntryPointFilterUtils {

    @Value("#{\"${skills.vue.entry.backend.resources:/api,/native,/vuejs/static,/vuejs/favicon.ico}\".split(\",\")}")
    private java.util.List<java.lang.String> backendResources;

    public boolean isFrontendResource(java.lang.String pathInfo) {
        return !isBackendResource(pathInfo);
    }

    public boolean isBackendResource(final java.lang.String pathInfo) {
        return asBoolean(backendResources) ? backendResources.stream().filter(ignoreUrl -> pathInfo.startsWith(ignoreUrl)).findFirst().isPresent() : false;
    }

    public static boolean asBoolean(Collection collection) {
        if (null == collection) {
            return false;
        }
        return !collection.isEmpty();
    }
}

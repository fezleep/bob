package com.bob.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "bob.app")
public record ApplicationInfoProperties(
        String name,
        String version
) {
}

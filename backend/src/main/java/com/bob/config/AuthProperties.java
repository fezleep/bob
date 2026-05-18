package com.bob.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "bob.auth")
public record AuthProperties(
        String jwtSecret,
        long jwtExpirationMinutes
) {
}

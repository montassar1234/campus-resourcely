package com.academic.smartlibrary.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String name,
        String message,
        String frontendUrl,
        Integer borrowDays,
        String jwtSecret,
        Integer jwtExpirationHours
) {
}

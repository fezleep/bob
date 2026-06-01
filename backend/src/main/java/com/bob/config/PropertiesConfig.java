package com.bob.config;

import com.bob.modules.ai.AiProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ApplicationInfoProperties.class, AuthProperties.class, AiProperties.class})
public class PropertiesConfig {
}

package com.bob.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class OpenApiConfig {

    @Bean
    OpenAPI bobOpenApi(ApplicationInfoProperties applicationInfo) {
        return new OpenAPI()
                .info(new Info()
                        .title("Bob API")
                        .description("REST API for Bob's lead workspace, authentication, follow-up, attention queue, and AI-assisted lead read workflows.")
                        .version(applicationInfo.version()));
    }
}

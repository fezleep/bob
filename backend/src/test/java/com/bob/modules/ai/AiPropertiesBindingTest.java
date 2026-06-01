package com.bob.modules.ai;

import com.bob.config.PropertiesConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = {PropertiesConfig.class, AiPropertiesBindingTest.TestConfig.class})
@TestPropertySource(properties = {
        "bob.ai.enabled=true",
        "bob.ai.model=test-model",
        "bob.ai.openai-api-key=test-key"
})
class AiPropertiesBindingTest {

    @Autowired
    private AiProperties aiProperties;

    @Test
    void bindsAiPropertiesFromExplicitSpringProperties() {
        assertThat(aiProperties.enabled()).isTrue();
        assertThat(aiProperties.normalizedModel()).isEqualTo("test-model");
        assertThat(aiProperties.configured()).isTrue();
        assertThat(aiProperties.openaiApiKey()).isNotBlank();
    }

    @SpringBootConfiguration
    static class TestConfig {
    }
}

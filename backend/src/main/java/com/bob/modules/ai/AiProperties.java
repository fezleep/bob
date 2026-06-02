package com.bob.modules.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "bob.ai")
public record AiProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("") String model,
        @DefaultValue("") String openaiApiKey
) {

    public boolean configured() {
        return enabled && present(openaiApiKey) && present(model);
    }

    public String unavailableMessage() {
        if (!enabled) {
            return "AI insights are disabled for this environment.";
        }
        if (!present(openaiApiKey)) {
            return "AI insights are unavailable because OPENAI_API_KEY is not configured.";
        }
        if (!present(model)) {
            return "AI insights are unavailable because BOB_AI_MODEL is not configured.";
        }
        return "AI insights are not configured for this environment.";
    }

    public String normalizedModel() {
        return model == null ? "" : model.trim();
    }

    private boolean present(String value) {
        return value != null && !value.isBlank();
    }
}

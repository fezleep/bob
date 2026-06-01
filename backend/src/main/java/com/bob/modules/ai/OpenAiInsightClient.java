package com.bob.modules.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

@Component
class OpenAiInsightClient implements AiInsightClient {

    private static final String RESPONSES_URL = "https://api.openai.com/v1/responses";

    private final AiProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    OpenAiInsightClient(AiProperties properties, ObjectMapper objectMapper, RestClient.Builder restClientBuilder) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = restClientBuilder.build();
    }

    @Override
    public AiGeneratedInsight generate(String leadContext) {
        try {
            String responseBody = restClient.post()
                    .uri(RESPONSES_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.openaiApiKey())
                    .body(requestBody(leadContext))
                    .retrieve()
                    .body(String.class);

            return parseInsight(responseBody);
        } catch (RestClientException | JsonProcessingException | IllegalArgumentException exception) {
            throw new AiProviderException("AI insight generation failed.", exception);
        }
    }

    private Map<String, Object> requestBody(String leadContext) {
        return Map.of(
                "model", properties.normalizedModel(),
                "instructions", """
                        Act as Bob, a calm operational assistant for lead management.
                        Use only the provided lead context. Do not invent facts.
                        Be concise, practical, and focused on the next useful action.
                        Return JSON only.
                        """,
                "input", leadContext,
                "max_output_tokens", 450,
                "text", Map.of(
                        "format", Map.of(
                                "type", "json_schema",
                                "name", "lead_operational_read",
                                "strict", true,
                                "schema", Map.of(
                                        "type", "object",
                                        "additionalProperties", false,
                                        "properties", Map.of(
                                                "summary", stringSchema("Short lead summary, one sentence."),
                                                "statusRead", stringSchema("Current operational status read, short phrase or sentence."),
                                                "nextAction", stringSchema("One practical next action."),
                                                "attention", stringSchema("Risk or attention signal. Use an empty string if none is relevant.")
                                        ),
                                        "required", List.of("summary", "statusRead", "nextAction", "attention")
                                )
                        )
                )
        );
    }

    private Map<String, String> stringSchema(String description) {
        return Map.of("type", "string", "description", description);
    }

    private AiGeneratedInsight parseInsight(String responseBody) throws JsonProcessingException {
        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalArgumentException("AI response body was empty.");
        }

        JsonNode root = objectMapper.readTree(responseBody);
        String outputText = root.path("output_text").asText("");

        if (outputText.isBlank()) {
            outputText = findOutputText(root);
        }

        if (outputText.isBlank()) {
            throw new IllegalArgumentException("AI response did not include output text.");
        }

        AiGeneratedInsight insight = objectMapper.readValue(outputText, AiGeneratedInsight.class);
        if (blank(insight.summary()) || blank(insight.statusRead()) || blank(insight.nextAction())) {
            throw new IllegalArgumentException("AI response missed required insight fields.");
        }

        return new AiGeneratedInsight(
                insight.summary().trim(),
                insight.statusRead().trim(),
                insight.nextAction().trim(),
                blank(insight.attention()) ? null : insight.attention().trim()
        );
    }

    private String findOutputText(JsonNode root) {
        JsonNode output = root.path("output");
        if (!output.isArray()) {
            return "";
        }

        for (JsonNode item : output) {
            JsonNode content = item.path("content");
            if (!content.isArray()) {
                continue;
            }
            for (JsonNode contentItem : content) {
                if ("output_text".equals(contentItem.path("type").asText())) {
                    return contentItem.path("text").asText("");
                }
            }
        }

        return "";
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}

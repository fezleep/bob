package com.bob.modules.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
class OpenAiInsightClient implements AiInsightClient {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiInsightClient.class);
    private static final String RESPONSES_URL = "https://api.openai.com/v1/responses";
    private static final String DEBUG_RESPONSE_SHAPE_ENV = "BOB_AI_DEBUG_RESPONSE_SHAPE";
    private static final int MAX_DEBUG_RESPONSE_CHARS = 1_200;

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
        String responseBody = null;
        int responseStatus = 0;
        String responseContentType = "";
        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(RESPONSES_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.openaiApiKey())
                    .body(requestBody(leadContext))
                    .retrieve()
                    .toEntity(String.class);
            responseStatus = response.getStatusCode().value();
            responseContentType = response.getHeaders().getContentType() == null
                    ? ""
                    : response.getHeaders().getContentType().toString();
            responseBody = response.getBody();

            return parseInsight(responseBody);
        } catch (RestClientResponseException exception) {
            logger.warn(
                    "AI provider request failed: category=provider_error status={} model={}",
                    exception.getStatusCode().value(),
                    properties.normalizedModel()
            );
            throw new AiProviderException(
                    "AI insight generation failed.",
                    AiProviderException.Category.PROVIDER_ERROR,
                    exception
            );
        } catch (RestClientException exception) {
            logger.warn(
                    "AI provider request failed: category=provider_error status=unavailable model={}",
                    properties.normalizedModel()
            );
            throw new AiProviderException(
                    "AI insight generation failed.",
                    AiProviderException.Category.PROVIDER_ERROR,
                    exception
            );
        } catch (JsonProcessingException | IllegalArgumentException exception) {
            logger.warn(
                    "AI provider response parsing failed: category=parsing_error status={} model={} reason={} message={} contentType={} bodyLength={} responseShape={}",
                    responseStatus == 0 ? "unavailable" : responseStatus,
                    properties.normalizedModel(),
                    exception.getClass().getSimpleName(),
                    safeExceptionMessage(exception),
                    responseContentType.isBlank() ? "unknown" : responseContentType,
                    bodyLength(responseBody),
                    safeResponseShape(responseBody)
            );
            if (debugResponseShapeEnabled()) {
                logger.warn(
                        "AI provider sanitized response sample: category=parsing_error status={} model={} responseSample={}",
                        responseStatus == 0 ? "unavailable" : responseStatus,
                        properties.normalizedModel(),
                        sanitizedResponseSample(responseBody)
                );
            }
            throw new AiProviderException(
                    "AI insight response parsing failed.",
                    AiProviderException.Category.PARSING_ERROR,
                    exception
            );
        }
    }

    private Map<String, Object> requestBody(String leadContext) {
        return Map.of(
                "model", properties.normalizedModel(),
                "instructions", """
                        Act as Bob, a calm operational assistant for lead management.
                        Use only the provided lead context. Do not invent facts.
                        Be concise, practical, and focused on the next useful action.
                        Return exactly one JSON object and no Markdown, comments, prose, or code fences.
                        The JSON object must include string fields: summary, statusRead, nextAction, attention.
                        Use an empty string for attention when no risk or attention signal is relevant.
                        Never include email addresses, JWT tokens, cookies, environment variables, headers, credentials, or secrets.
                        """,
                "input", sanitizeLeadContext(leadContext),
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

    private String sanitizeLeadContext(String leadContext) {
        if (leadContext == null || leadContext.isBlank()) {
            return "";
        }
        return leadContext
                .replaceAll("(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b", "[redacted-email]")
                .replaceAll("(?i)(Bearer\\s+)[A-Za-z0-9._~+/=-]+", "$1[redacted]")
                .replaceAll("\\b[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\b", "[redacted-jwt]")
                .replaceAll("(?i)(api[_-]?key|authorization|cookie|set-cookie|token|password|secret)\\s*[:=]\\s*\\S+", "$1=[redacted]");
    }

    private AiGeneratedInsight parseInsight(String responseBody) throws JsonProcessingException {
        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalArgumentException("empty provider response");
        }

        JsonNode root = objectMapper.readTree(responseBody);
        String outputText = extractResponseText(root);
        if (outputText.isBlank()) {
            throw new IllegalArgumentException("AI response did not include output text.");
        }

        JsonNode insightJson = objectMapper.readTree(stripMarkdownFence(outputText));
        String summary = textValue(insightJson, "summary");
        String statusRead = firstTextValue(insightJson, "statusRead", "operationalRead");
        String nextAction = textValue(insightJson, "nextAction");
        String attention = textValue(insightJson, "attention");

        if (blank(summary) || blank(statusRead) || blank(nextAction)) {
            throw new IllegalArgumentException("AI response missed required insight fields.");
        }

        return new AiGeneratedInsight(
                summary.trim(),
                statusRead.trim(),
                nextAction.trim(),
                blank(attention) ? null : attention.trim()
        );
    }

    private String extractResponseText(JsonNode root) {
        String outputText = textNodeValue(root.path("output_text"));
        if (!blank(outputText)) {
            return outputText;
        }

        String topLevelText = textNodeValue(root.path("text"));
        if (!blank(topLevelText)) {
            return topLevelText;
        }

        String messageText = containerText(root.path("message"));
        if (!blank(messageText)) {
            return messageText;
        }

        JsonNode output = root.path("output");
        StringBuilder text = new StringBuilder();
        if (output.isArray()) {
            for (JsonNode item : output) {
                appendOutputItemText(item, text);
            }
        }

        appendContainerText(root.path("content"), text);
        return text.toString().trim();
    }

    private void appendOutputItemText(JsonNode item, StringBuilder text) {
        String itemText = textNodeValue(item.path("output_text"));
        if (!blank(itemText)) {
            appendText(text, itemText);
        }

        if (isTextType(item.path("type").asText(""))) {
            appendText(text, textNodeValue(item.path("text")));
        }

        appendContainerText(item.path("message"), text);
        appendContainerText(item.path("content"), text);
    }

    private void appendContentItemText(JsonNode contentItem, StringBuilder text) {
        if (contentItem == null || contentItem.isMissingNode() || contentItem.isNull()) {
            return;
        }
        if (contentItem.isTextual()) {
            appendText(text, contentItem.asText());
            return;
        }
        if (!contentItem.isObject()) {
            return;
        }

        String type = contentItem.path("type").asText("");
        if (isRefusalType(type)) {
            return;
        }

        JsonNode textNode = contentItem.path("text");

        if (isTextType(type) || !textNode.isMissingNode()) {
            appendText(text, textNodeValue(textNode));
        }

        if (isTextType(type)) {
            appendText(text, textNodeValue(contentItem.path("value")));
        }

        appendContainerText(contentItem.path("message"), text);
        appendContainerText(contentItem.path("content"), text);
    }

    private String containerText(JsonNode node) {
        StringBuilder text = new StringBuilder();
        appendContainerText(node, text);
        return text.toString().trim();
    }

    private void appendContainerText(JsonNode node, StringBuilder text) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return;
        }
        if (node.isTextual()) {
            appendText(text, node.asText());
            return;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                appendContentItemText(item, text);
            }
            return;
        }
        if (node.isObject()) {
            appendText(text, textNodeValue(node.path("output_text")));
            appendText(text, textNodeValue(node.path("text")));
            appendContainerText(node.path("message"), text);
            appendContainerText(node.path("content"), text);
        }
    }

    private boolean isTextType(String type) {
        return type != null && type.toLowerCase().contains("text");
    }

    private boolean isRefusalType(String type) {
        return type != null && type.toLowerCase().contains("refusal");
    }

    private String textNodeValue(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        if (node.isTextual()) {
            return node.asText();
        }
        if (node.isArray()) {
            StringBuilder text = new StringBuilder();
            for (JsonNode item : node) {
                appendText(text, textNodeValue(item));
            }
            return text.toString();
        }
        if (node.isObject()) {
            String value = textNodeValue(node.path("value"));
            if (!blank(value)) {
                return value;
            }
            return textNodeValue(node.path("text"));
        }
        return "";
    }

    private void appendText(StringBuilder target, String value) {
        if (blank(value)) {
            return;
        }
        if (!target.isEmpty()) {
            target.append('\n');
        }
        target.append(value);
    }

    private String stripMarkdownFence(String value) {
        String trimmed = value.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }

        int firstLineEnd = trimmed.indexOf('\n');
        int closingFenceStart = trimmed.lastIndexOf("```");
        if (firstLineEnd < 0 || closingFenceStart <= firstLineEnd) {
            return trimmed;
        }

        return trimmed.substring(firstLineEnd + 1, closingFenceStart).trim();
    }

    private String firstTextValue(JsonNode root, String... fieldNames) {
        for (String fieldName : fieldNames) {
            String value = textValue(root, fieldName);
            if (!blank(value)) {
                return value;
            }
        }
        return "";
    }

    private String textValue(JsonNode root, String fieldName) {
        JsonNode value = root.path(fieldName);
        if (value.isNull() || value.isMissingNode()) {
            return "";
        }
        return value.isTextual() ? value.asText() : "";
    }

    private String safeResponseShape(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "empty";
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            Map<String, Object> shape = new LinkedHashMap<>();
            shape.put("topLevelFields", fieldNames(root));
            shape.put("outputTextPresent", root.has("output_text"));
            shape.put("topLevelTextPresent", root.has("text"));
            shape.put("messagePresent", root.has("message"));
            shape.put("outputItemCount", outputItemCount(root));
            shape.put("outputItemTypes", outputItemTypes(root));
            shape.put("contentItemTypes", contentItemTypes(root));
            shape.put("textFieldCount", countFieldsNamed(root, "text"));
            shape.put("refusalFieldCount", countFieldsNamed(root, "refusal"));
            shape.put("extractedTextLength", extractResponseText(root).length());
            shape.put("bodyLength", responseBody.length());
            return objectMapper.writeValueAsString(shape);
        } catch (JsonProcessingException exception) {
            return "unparseable_json";
        } catch (RuntimeException exception) {
            return "shape_unavailable";
        }
    }

    private List<String> fieldNames(JsonNode node) {
        List<String> names = new ArrayList<>();
        if (node == null || !node.isObject()) {
            return names;
        }

        Iterator<String> fieldNames = node.fieldNames();
        while (fieldNames.hasNext()) {
            names.add(fieldNames.next());
        }
        return names;
    }

    private int outputItemCount(JsonNode root) {
        JsonNode output = root.path("output");
        return output.isArray() ? output.size() : 0;
    }

    private List<String> outputItemTypes(JsonNode root) {
        List<String> types = new ArrayList<>();
        JsonNode output = root.path("output");
        if (!output.isArray()) {
            return types;
        }

        for (JsonNode item : output) {
            String type = item.path("type").asText("");
            types.add(blank(type) ? "(missing)" : type);
        }
        return types;
    }

    private List<String> contentItemTypes(JsonNode root) {
        List<String> types = new ArrayList<>();
        collectContentItemTypes(root, types);
        return types;
    }

    private void collectContentItemTypes(JsonNode node, List<String> types) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                collectContentItemTypes(item, types);
            }
            return;
        }
        if (!node.isObject()) {
            return;
        }

        if (node.has("content")) {
            JsonNode content = node.path("content");
            if (content.isArray()) {
                for (JsonNode contentItem : content) {
                    String type = contentItem.path("type").asText("");
                    types.add(blank(type) ? "(missing)" : type);
                    collectContentItemTypes(contentItem, types);
                }
            } else {
                collectContentItemTypes(content, types);
            }
        }

        collectContentItemTypes(node.path("message"), types);
        collectContentItemTypes(node.path("output"), types);
    }

    private int countFieldsNamed(JsonNode node, String fieldName) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return 0;
        }
        if (node.isArray()) {
            int count = 0;
            for (JsonNode item : node) {
                count += countFieldsNamed(item, fieldName);
            }
            return count;
        }
        if (!node.isObject()) {
            return 0;
        }

        int count = 0;
        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            if (fieldName.equals(field.getKey())) {
                count++;
            }
            count += countFieldsNamed(field.getValue(), fieldName);
        }
        return count;
    }

    private boolean debugResponseShapeEnabled() {
        return "true".equalsIgnoreCase(System.getenv(DEBUG_RESPONSE_SHAPE_ENV));
    }

    private String sanitizedResponseSample(String responseBody) {
        if (responseBody == null) {
            return "";
        }

        String sample = responseBody
                .replaceAll("(?i)(\"(?:authorization|cookie|set-cookie|api[_-]?key|token|jwt|secret)\"\\s*:\\s*\")[^\"]*(\")", "$1[redacted]$2")
                .replaceAll("(?i)(Bearer\\s+)[A-Za-z0-9._~+/=-]+", "$1[redacted]");
        if (sample.length() <= MAX_DEBUG_RESPONSE_CHARS) {
            return sample;
        }
        return sample.substring(0, MAX_DEBUG_RESPONSE_CHARS) + "...[truncated]";
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private int bodyLength(String responseBody) {
        return responseBody == null ? 0 : responseBody.length();
    }

    private String safeExceptionMessage(Exception exception) {
        String message = exception.getMessage();
        if (message == null || message.isBlank()) {
            return exception.getClass().getSimpleName();
        }
        return message
                .replaceAll("(?i)(Bearer\\s+)[A-Za-z0-9._~+/=-]+", "$1[redacted]")
                .replaceAll("(?i)(api[_-]?key|authorization|token|password|secret)=\\S+", "$1=[redacted]");
    }
}

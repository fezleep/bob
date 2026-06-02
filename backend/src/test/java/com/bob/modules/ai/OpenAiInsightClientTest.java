package com.bob.modules.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withBadRequest;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(OutputCaptureExtension.class)
class OpenAiInsightClientTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void sendsResponsesRequestAndParsesTopLevelOutputText() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer test-key"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.model").value("test-model"))
                .andExpect(jsonPath("$.input").value("Lead context"))
                .andExpect(jsonPath("$.text.format.type").value("json_schema"))
                .andExpect(jsonPath("$.text.format.name").value("lead_operational_read"))
                .andExpect(jsonPath("$.text.format.schema.required[0]").value("summary"))
                .andExpect(jsonPath("$.instructions").value(org.hamcrest.Matchers.containsString("Return exactly one JSON object")))
                .andRespond(withSuccess("""
                        {
                          "output_text": "{\\"summary\\":\\"Short summary.\\",\\"statusRead\\":\\"Warm.\\",\\"nextAction\\":\\"Follow up.\\",\\"attention\\":\\"\\"}"
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Short summary.");
        assertThat(insight.statusRead()).isEqualTo("Warm.");
        assertThat(insight.nextAction()).isEqualTo("Follow up.");
        assertThat(insight.attention()).isNull();
        server.verify();
    }

    @Test
    void redactsSensitiveValuesFromRequestInput() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andExpect(jsonPath("$.input").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("lead@example.com"))))
                .andExpect(jsonPath("$.input").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("Bearer abcdef"))))
                .andExpect(jsonPath("$.input").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret-value"))))
                .andExpect(jsonPath("$.input").value(org.hamcrest.Matchers.containsString("[redacted-email]")))
                .andExpect(jsonPath("$.input").value(org.hamcrest.Matchers.containsString("Bearer [redacted]")))
                .andRespond(withSuccess("""
                        {
                          "output_text": "{\\"summary\\":\\"Safe summary.\\",\\"statusRead\\":\\"Open.\\",\\"nextAction\\":\\"Review note.\\",\\"attention\\":\\"\\"}"
                        }
                        """, MediaType.APPLICATION_JSON));

        client.generate("Email lead@example.com Bearer abcdef token=secret-value");

        server.verify();
    }

    @Test
    void parsesTextFromOutputArrayMessageContent() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output": [
                            {
                              "type": "reasoning",
                              "summary": []
                            },
                            {
                              "type": "message",
                              "content": [
                                {
                                  "type": "output_text",
                                  "text": {
                                    "value": "{\\"summary\\":\\"Array summary.\\",\\"operationalRead\\":\\"Needs review.\\",\\"nextAction\\":\\"Call today.\\",\\"attention\\":\\"Budget unclear.\\"}"
                                  }
                                }
                              ]
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Array summary.");
        assertThat(insight.statusRead()).isEqualTo("Needs review.");
        assertThat(insight.nextAction()).isEqualTo("Call today.");
        assertThat(insight.attention()).isEqualTo("Budget unclear.");
        server.verify();
    }

    @Test
    void parsesMarkdownFencedJsonOutput() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output_text": "```json\\n{\\"summary\\":\\"Fenced summary.\\",\\"statusRead\\":\\"Active.\\",\\"nextAction\\":\\"Send proposal.\\",\\"attention\\":\\"\\"}\\n```"
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Fenced summary.");
        assertThat(insight.statusRead()).isEqualTo("Active.");
        assertThat(insight.nextAction()).isEqualTo("Send proposal.");
        assertThat(insight.attention()).isNull();
        server.verify();
    }

    @Test
    void parsesDirectContentTextString() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output": [
                            {
                              "type": "message",
                              "content": [
                                {
                                  "type": "text",
                                  "text": "{\\"summary\\":\\"Direct text summary.\\",\\"statusRead\\":\\"Ready.\\",\\"nextAction\\":\\"Book demo.\\",\\"attention\\":\\"\\"}"
                                }
                              ]
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Direct text summary.");
        assertThat(insight.statusRead()).isEqualTo("Ready.");
        assertThat(insight.nextAction()).isEqualTo("Book demo.");
        assertThat(insight.attention()).isNull();
        server.verify();
    }

    @Test
    void parsesTopLevelTextObjectValue() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "text": {
                            "value": "{\\"summary\\":\\"Object text summary.\\",\\"statusRead\\":\\"Qualified.\\",\\"nextAction\\":\\"Send pricing.\\",\\"attention\\":\\"Timeline tight.\\"}"
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Object text summary.");
        assertThat(insight.statusRead()).isEqualTo("Qualified.");
        assertThat(insight.nextAction()).isEqualTo("Send pricing.");
        assertThat(insight.attention()).isEqualTo("Timeline tight.");
        server.verify();
    }

    @Test
    void parsesOutputItemWithNestedMessageContent() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output": [
                            {
                              "type": "response",
                              "message": {
                                "content": [
                                  {
                                    "type": "output_text",
                                    "text": "{\\"summary\\":\\"Nested message summary.\\",\\"statusRead\\":\\"Waiting.\\",\\"nextAction\\":\\"Confirm stakeholders.\\",\\"attention\\":\\"\\"}"
                                  }
                                ]
                              }
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        AiGeneratedInsight insight = client.generate("Lead context");

        assertThat(insight.summary()).isEqualTo("Nested message summary.");
        assertThat(insight.statusRead()).isEqualTo("Waiting.");
        assertThat(insight.nextAction()).isEqualTo("Confirm stakeholders.");
        assertThat(insight.attention()).isNull();
        server.verify();
    }

    @Test
    void refusalWithoutTextIsCategorizedAsParsingError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output": [
                            {
                              "type": "message",
                              "content": [
                                {
                                  "type": "refusal",
                                  "refusal": "Cannot provide that."
                                }
                              ]
                            }
                          ]
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.generate("Lead context"))
                .isInstanceOfSatisfying(AiProviderException.class, exception ->
                        assertThat(exception.category()).isEqualTo(AiProviderException.Category.PARSING_ERROR));

        server.verify();
    }

    @Test
    void providerErrorIsCategorizedAsProviderError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andExpect(header("Authorization", startsWith("Bearer ")))
                .andRespond(withBadRequest().body("{}").contentType(MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.generate("Lead context"))
                .isInstanceOfSatisfying(AiProviderException.class, exception ->
                        assertThat(exception.category()).isEqualTo(AiProviderException.Category.PROVIDER_ERROR));

        server.verify();
    }

    @Test
    void blankSuccessBodyIsCategorizedAsParsingError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.generate("Lead context"))
                .isInstanceOfSatisfying(AiProviderException.class, exception -> {
                    assertThat(exception.category()).isEqualTo(AiProviderException.Category.PARSING_ERROR);
                    assertThat(exception.getCause()).hasMessage("empty provider response");
                });

        server.verify();
    }

    @Test
    void missingTextResponseIsCategorizedAsParsingError(CapturedOutput output) {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output": []
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.generate("Lead context"))
                .isInstanceOfSatisfying(AiProviderException.class, exception ->
                        assertThat(exception.category()).isEqualTo(AiProviderException.Category.PARSING_ERROR));

        assertThat(output).contains("responseShape=");
        assertThat(output).contains("outputItemCount");
        assertThat(output).contains("bodyLength");
        assertThat(output).doesNotContain("\"output\": []");
        server.verify();
    }

    @Test
    void malformedJsonOutputIsCategorizedAsParsingError() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        OpenAiInsightClient client = new OpenAiInsightClient(
                new AiProperties(true, "test-model", "test-key"),
                objectMapper,
                builder
        );

        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess("""
                        {
                          "output_text": "not json"
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.generate("Lead context"))
                .isInstanceOfSatisfying(AiProviderException.class, exception ->
                        assertThat(exception.category()).isEqualTo(AiProviderException.Category.PARSING_ERROR));

        server.verify();
    }
}

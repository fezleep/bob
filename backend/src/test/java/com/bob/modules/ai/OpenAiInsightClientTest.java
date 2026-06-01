package com.bob.modules.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
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

class OpenAiInsightClientTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void sendsResponsesRequestAndParsesOutputText() {
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
                .andRespond(withSuccess("""
                        {
                          "output": [
                            {
                              "content": [
                                {
                                  "type": "output_text",
                                  "text": "{\\"summary\\":\\"Short summary.\\",\\"statusRead\\":\\"Warm.\\",\\"nextAction\\":\\"Follow up.\\",\\"attention\\":\\"\\"}"
                                }
                              ]
                            }
                          ]
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
    void malformedResponseIsCategorizedAsParsingError() {
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

        server.verify();
    }
}

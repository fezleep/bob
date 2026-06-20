package com.bob.modules.system;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.test.web.servlet.MockMvc;

import com.bob.config.ApplicationInfoProperties;
import com.bob.modules.auth.JwtService;
import com.bob.modules.ai.AiProperties;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SystemStatusController.class)
@AutoConfigureMockMvc(addFilters = false)
class SystemStatusControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @Test
    void returnsSystemStatus() throws Exception {
        mockMvc.perform(get("/api/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.appName").value("bob"))
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.version").value("0.1.0"))
                .andExpect(jsonPath("$.aiEnabled").value(false))
                .andExpect(jsonPath("$.cacheMode").value("in-memory"))
                .andExpect(jsonPath("$.openApiAvailable").value(true));
    }

    @TestConfiguration
    static class TestConfig {

        @Bean
        ApplicationInfoProperties applicationInfoProperties() {
            return new ApplicationInfoProperties("bob", "0.1.0");
        }

        @Bean
        AiProperties aiProperties() {
            return new AiProperties(false, "", "");
        }
    }
}

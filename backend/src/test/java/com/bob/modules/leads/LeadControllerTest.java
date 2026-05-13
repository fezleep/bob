package com.bob.modules.leads;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LeadController.class)
class LeadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LeadService leadService;

    @Test
    void createsLead() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        LeadResponse response = new LeadResponse(
                id,
                "Ada Lovelace",
                "ada@example.com",
                "Analytical Engines",
                LeadStatus.NEW,
                createdAt,
                createdAt
        );

        when(leadService.create(org.mockito.ArgumentMatchers.any(CreateLeadRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeadRequest(
                                "Ada Lovelace",
                                "ada@example.com",
                                "Analytical Engines",
                                LeadStatus.NEW
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Ada Lovelace"))
                .andExpect(jsonPath("$.email").value("ada@example.com"))
                .andExpect(jsonPath("$.company").value("Analytical Engines"))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.createdAt").value("2026-05-13T10:00:00Z"));

        ArgumentCaptor<CreateLeadRequest> requestCaptor = ArgumentCaptor.forClass(CreateLeadRequest.class);
        verify(leadService).create(requestCaptor.capture());

        assertThat(requestCaptor.getValue().name()).isEqualTo("Ada Lovelace");
        assertThat(requestCaptor.getValue().email()).isEqualTo("ada@example.com");
        assertThat(requestCaptor.getValue().company()).isEqualTo("Analytical Engines");
        assertThat(requestCaptor.getValue().status()).isEqualTo(LeadStatus.NEW);
    }

    @Test
    void rejectsInvalidCreateRequest() throws Exception {
        mockMvc.perform(post("/api/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "email": "not-an-email",
                                  "status": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request validation failed"))
                .andExpect(jsonPath("$.fields.length()").value(3));
    }

    @Test
    void listsLeadsWithPagingSortingAndStatusFilter() throws Exception {
        OffsetDateTime now = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        LeadListResponse response = new LeadListResponse(
                List.of(
                        new LeadResponse(
                                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                                "Grace Hopper",
                                null,
                                "Compiler Co",
                                LeadStatus.QUALIFIED,
                                now,
                                now
                        )
                ),
                1,
                10,
                21,
                3
        );

        when(leadService.list(1, 10, "name", "asc", LeadStatus.QUALIFIED))
                .thenReturn(response);

        mockMvc.perform(get("/api/leads")
                        .param("page", "1")
                        .param("size", "10")
                        .param("sort", "name")
                        .param("direction", "asc")
                        .param("status", "QUALIFIED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leads.length()").value(1))
                .andExpect(jsonPath("$.leads[0].name").value("Grace Hopper"))
                .andExpect(jsonPath("$.leads[0].status").value("QUALIFIED"))
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(21))
                .andExpect(jsonPath("$.totalPages").value(3));

        verify(leadService).list(eq(1), eq(10), eq("name"), eq("asc"), eq(LeadStatus.QUALIFIED));
    }
}

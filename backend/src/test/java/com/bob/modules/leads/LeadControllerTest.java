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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    @Test
    void updatesLead() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        OffsetDateTime updatedAt = OffsetDateTime.parse("2026-05-13T11:00:00Z");
        LeadResponse response = new LeadResponse(
                id,
                "Ada Byron",
                "ada.byron@example.com",
                "Numbers Ltd",
                LeadStatus.CONTACTED,
                createdAt,
                updatedAt
        );

        when(leadService.update(eq(id), org.mockito.ArgumentMatchers.any(UpdateLeadRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/leads/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateLeadRequest(
                                "Ada Byron",
                                "ada.byron@example.com",
                                "Numbers Ltd",
                                LeadStatus.CONTACTED
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()))
                .andExpect(jsonPath("$.name").value("Ada Byron"))
                .andExpect(jsonPath("$.email").value("ada.byron@example.com"))
                .andExpect(jsonPath("$.company").value("Numbers Ltd"))
                .andExpect(jsonPath("$.status").value("CONTACTED"))
                .andExpect(jsonPath("$.updatedAt").value("2026-05-13T11:00:00Z"));

        ArgumentCaptor<UpdateLeadRequest> requestCaptor = ArgumentCaptor.forClass(UpdateLeadRequest.class);
        verify(leadService).update(eq(id), requestCaptor.capture());

        assertThat(requestCaptor.getValue().name()).isEqualTo("Ada Byron");
        assertThat(requestCaptor.getValue().email()).isEqualTo("ada.byron@example.com");
        assertThat(requestCaptor.getValue().company()).isEqualTo("Numbers Ltd");
        assertThat(requestCaptor.getValue().status()).isEqualTo(LeadStatus.CONTACTED);
    }

    @Test
    void changesLeadStatus() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        LeadResponse response = new LeadResponse(
                id,
                "Grace Hopper",
                null,
                "Compiler Co",
                LeadStatus.CONTACTED,
                now,
                now
        );

        when(leadService.changeStatus(eq(id), org.mockito.ArgumentMatchers.any(ChangeLeadStatusRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/api/leads/{id}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ChangeLeadStatusRequest(LeadStatus.CONTACTED))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONTACTED"));

        ArgumentCaptor<ChangeLeadStatusRequest> requestCaptor = ArgumentCaptor.forClass(ChangeLeadStatusRequest.class);
        verify(leadService).changeStatus(eq(id), requestCaptor.capture());

        assertThat(requestCaptor.getValue().status()).isEqualTo(LeadStatus.CONTACTED);
    }

    @Test
    void addsNote() throws Exception {
        UUID leadId = UUID.randomUUID();
        UUID noteId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        LeadNoteResponse response = new LeadNoteResponse(noteId, leadId, "Called and left voicemail.", createdAt);

        when(leadService.addNote(eq(leadId), org.mockito.ArgumentMatchers.any(CreateLeadNoteRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/leads/{id}/notes", leadId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateLeadNoteRequest("Called and left voicemail."))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(noteId.toString()))
                .andExpect(jsonPath("$.leadId").value(leadId.toString()))
                .andExpect(jsonPath("$.content").value("Called and left voicemail."))
                .andExpect(jsonPath("$.createdAt").value("2026-05-13T10:00:00Z"));

        ArgumentCaptor<CreateLeadNoteRequest> requestCaptor = ArgumentCaptor.forClass(CreateLeadNoteRequest.class);
        verify(leadService).addNote(eq(leadId), requestCaptor.capture());

        assertThat(requestCaptor.getValue().content()).isEqualTo("Called and left voicemail.");
    }

    @Test
    void listsNotes() throws Exception {
        UUID leadId = UUID.randomUUID();
        UUID noteId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");

        when(leadService.listNotes(leadId))
                .thenReturn(List.of(new LeadNoteResponse(noteId, leadId, "Sent pricing.", createdAt)));

        mockMvc.perform(get("/api/leads/{id}/notes", leadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(noteId.toString()))
                .andExpect(jsonPath("$[0].leadId").value(leadId.toString()))
                .andExpect(jsonPath("$[0].content").value("Sent pricing."));

        verify(leadService).listNotes(leadId);
    }

    @Test
    void listsActivities() throws Exception {
        UUID leadId = UUID.randomUUID();
        UUID activityId = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");

        when(leadService.listActivities(leadId))
                .thenReturn(List.of(new LeadActivityResponse(
                        activityId,
                        leadId,
                        LeadActivityType.STATUS_CHANGED,
                        "Status changed from NEW to CONTACTED",
                        createdAt
                )));

        mockMvc.perform(get("/api/leads/{id}/activities", leadId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(activityId.toString()))
                .andExpect(jsonPath("$[0].leadId").value(leadId.toString()))
                .andExpect(jsonPath("$[0].type").value("STATUS_CHANGED"))
                .andExpect(jsonPath("$[0].description").value("Status changed from NEW to CONTACTED"));

        verify(leadService).listActivities(leadId);
    }
}

package com.bob.modules.leads;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private LeadNoteRepository leadNoteRepository;

    @Mock
    private LeadActivityRepository leadActivityRepository;

    private LeadService leadService;

    @BeforeEach
    void setUp() {
        leadService = new LeadService(leadRepository, leadNoteRepository, leadActivityRepository);
    }

    @Test
    void updatesLead() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.QUALIFIED);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

        LeadResponse response = leadService.update(leadId, new UpdateLeadRequest(
                " Ada Byron ",
                " ada@example.com ",
                " Numbers Ltd ",
                LeadStatus.QUALIFIED
        ));

        assertThat(response.name()).isEqualTo("Ada Byron");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.company()).isEqualTo("Numbers Ltd");
        assertThat(response.status()).isEqualTo(LeadStatus.QUALIFIED);
        assertThat(response.updatedAt()).isAfter(response.createdAt());
        verify(leadActivityRepository, never()).save(any(LeadActivity.class));
    }

    @Test
    void updatingLeadStatusCreatesActivity() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

        leadService.update(leadId, new UpdateLeadRequest(
                "Ada Byron",
                "ada@example.com",
                "Numbers Ltd",
                LeadStatus.QUALIFIED
        ));

        ArgumentCaptor<LeadActivity> activityCaptor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(leadActivityRepository).save(activityCaptor.capture());

        assertThat(activityCaptor.getValue().getLead()).isSameAs(lead);
        assertThat(activityCaptor.getValue().getType()).isEqualTo(LeadActivityType.STATUS_CHANGED);
        assertThat(activityCaptor.getValue().getDescription()).isEqualTo("Status changed from NEW to QUALIFIED");
    }

    @Test
    void changingStatusCreatesActivity() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

        leadService.changeStatus(leadId, new ChangeLeadStatusRequest(LeadStatus.CONTACTED));

        ArgumentCaptor<LeadActivity> activityCaptor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(leadActivityRepository).save(activityCaptor.capture());

        assertThat(activityCaptor.getValue().getLead()).isSameAs(lead);
        assertThat(activityCaptor.getValue().getType()).isEqualTo(LeadActivityType.STATUS_CHANGED);
        assertThat(activityCaptor.getValue().getDescription()).isEqualTo("Status changed from NEW to CONTACTED");
    }

    @Test
    void changingStatusToSameValueDoesNotCreateActivity() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

        leadService.changeStatus(leadId, new ChangeLeadStatusRequest(LeadStatus.CONTACTED));

        verify(leadActivityRepository, never()).save(any(LeadActivity.class));
    }

    @Test
    void addingNoteCreatesActivity() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.save(any(LeadNote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeadNoteResponse response = leadService.addNote(leadId, new CreateLeadNoteRequest(" First call completed. "));

        assertThat(response.content()).isEqualTo("First call completed.");

        ArgumentCaptor<LeadActivity> activityCaptor = ArgumentCaptor.forClass(LeadActivity.class);
        verify(leadActivityRepository).save(activityCaptor.capture());

        assertThat(activityCaptor.getValue().getLead()).isSameAs(lead);
        assertThat(activityCaptor.getValue().getType()).isEqualTo(LeadActivityType.NOTE_ADDED);
        assertThat(activityCaptor.getValue().getDescription()).isEqualTo("Note added");
    }

    @Test
    void listsNotes() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);
        LeadNote note = note(UUID.randomUUID(), lead, "Sent pricing.");

        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of(note));

        List<LeadNoteResponse> response = leadService.listNotes(leadId);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().leadId()).isEqualTo(leadId);
        assertThat(response.getFirst().content()).isEqualTo("Sent pricing.");
    }

    @Test
    void listsActivities() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);
        LeadActivity activity = activity(UUID.randomUUID(), lead, LeadActivityType.LEAD_CREATED, "Lead created");

        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of(activity));

        List<LeadActivityResponse> response = leadService.listActivities(leadId);

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().leadId()).isEqualTo(leadId);
        assertThat(response.getFirst().type()).isEqualTo(LeadActivityType.LEAD_CREATED);
        assertThat(response.getFirst().description()).isEqualTo("Lead created");
    }

    private static Lead lead(UUID id, LeadStatus status) {
        Lead lead = new Lead("Ada Lovelace", "ada@example.com", "Analytical Engines", status);
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-05-13T10:00:00Z");
        ReflectionTestUtils.setField(lead, "id", id);
        ReflectionTestUtils.setField(lead, "createdAt", createdAt);
        ReflectionTestUtils.setField(lead, "updatedAt", createdAt);
        return lead;
    }

    private static LeadNote note(UUID id, Lead lead, String content) {
        LeadNote note = new LeadNote(lead, content);
        ReflectionTestUtils.setField(note, "id", id);
        ReflectionTestUtils.setField(note, "createdAt", OffsetDateTime.parse("2026-05-13T10:00:00Z"));
        return note;
    }

    private static LeadActivity activity(UUID id, Lead lead, LeadActivityType type, String description) {
        LeadActivity activity = new LeadActivity(lead, type, description);
        ReflectionTestUtils.setField(activity, "id", id);
        ReflectionTestUtils.setField(activity, "createdAt", OffsetDateTime.parse("2026-05-13T10:00:00Z"));
        return activity;
    }
}

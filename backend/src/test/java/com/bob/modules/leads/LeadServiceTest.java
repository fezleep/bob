package com.bob.modules.leads;

import com.bob.modules.ai.AiGeneratedInsight;
import com.bob.modules.ai.AiInsightClient;
import com.bob.modules.ai.AiProperties;
import com.bob.modules.ai.AiProviderException;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private LeadNoteRepository leadNoteRepository;

    @Mock
    private LeadActivityRepository leadActivityRepository;

    @Mock
    private LeadInsightRepository leadInsightRepository;

    @Mock
    private AiInsightClient aiInsightClient;

    private LeadService leadService;
    private AiProperties aiProperties;

    @BeforeEach
    void setUp() {
        aiProperties = new AiProperties(true, "test-model", "test-key");
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                aiProperties,
                aiInsightClient
        );
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

    @Test
    void returnsUnavailableInsightStateWhenAiIsNotConfigured() {
        UUID leadId = UUID.randomUUID();
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(false, "", ""),
                aiInsightClient
        );

        when(leadRepository.existsById(leadId)).thenReturn(true);

        LeadInsightResponse response = leadService.getInsight(leadId);

        assertThat(response.aiAvailable()).isFalse();
        assertThat(response.message()).isEqualTo("AI insights are disabled for this environment.");
        assertThat(response.summary()).isNull();
    }

    @Test
    void generationReturnsUnavailableWhenAiIsDisabledWithoutCallingProvider() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(false, "test-model", "test-key"),
                aiInsightClient
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.aiAvailable()).isFalse();
        assertThat(response.message()).isEqualTo("AI insights are disabled for this environment.");
        assertThat(response.message()).doesNotContain("test-key");
        verify(aiInsightClient, never()).generate(any());
    }

    @Test
    void generationReturnsUnavailableWhenApiKeyIsMissingWithoutCallingProvider() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(true, "test-model", ""),
                aiInsightClient
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.aiAvailable()).isFalse();
        assertThat(response.message()).isEqualTo("AI insights are unavailable because OPENAI_API_KEY is not configured.");
        assertThat(response.message()).doesNotContain("test-key");
        verify(aiInsightClient, never()).generate(any());
    }

    @Test
    void generationReturnsUnavailableWhenModelIsMissingWithoutCallingProvider() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(true, "", "test-key"),
                aiInsightClient
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.aiAvailable()).isFalse();
        assertThat(response.message()).isEqualTo("AI insights are unavailable because BOB_AI_MODEL is not configured.");
        assertThat(response.message()).doesNotContain("test-key");
        verify(aiInsightClient, never()).generate(any());
    }

    @Test
    void returnsSavedInsightWhenAiIsDisabled() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        LeadInsight savedInsight = insight(lead);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(false, "test-model", "test-key"),
                aiInsightClient
        );

        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.of(savedInsight));

        LeadInsightResponse response = leadService.getInsight(leadId);

        assertThat(response.aiAvailable()).isFalse();
        assertThat(response.summary()).isEqualTo("Analytical Engines has a saved read.");
        assertThat(response.statusRead()).isEqualTo("conversation is warm");
        assertThat(response.nextAction()).isEqualTo("Send the next practical follow-up.");
        assertThat(response.message()).contains("Showing the latest saved Bob read.");
        verifyNoInteractions(aiInsightClient);
    }

    @Test
    void generatesAndPersistsLeadInsight() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        LeadNote note = note(UUID.randomUUID(), lead, "Asked for a timeline next week.");
        LeadActivity activity = activity(UUID.randomUUID(), lead, LeadActivityType.NOTE_ADDED, "Note added");

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of(note));
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of(activity));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());
        when(aiInsightClient.generate(org.mockito.ArgumentMatchers.contains("Asked for a timeline")))
                .thenReturn(new AiGeneratedInsight(
                        "Analytical Engines has a fresh conversation around timing.",
                        "conversation is warming up",
                        "Follow up to confirm timeline and decision owner.",
                        "Do not let the lead go quiet for more than 2 days."
                ));
        when(leadInsightRepository.save(any(LeadInsight.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.aiAvailable()).isTrue();
        assertThat(response.summary()).isEqualTo("Analytical Engines has a fresh conversation around timing.");
        assertThat(response.statusRead()).isEqualTo("conversation is warming up");
        assertThat(response.model()).isEqualTo("test-model");
        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(aiInsightClient).generate(promptCaptor.capture());
        assertThat(promptCaptor.getValue()).contains("Asked for a timeline next week.");
        assertThat(promptCaptor.getValue()).doesNotContain("ada@example.com");
        assertThat(promptCaptor.getValue()).doesNotContain("Authorization");
        assertThat(promptCaptor.getValue()).doesNotContain("OPENAI_API_KEY");
        verify(leadInsightRepository).save(any(LeadInsight.class));
    }

    @Test
    void configuredAiIsConsideredAvailableBeforeGeneration() {
        UUID leadId = UUID.randomUUID();

        when(leadRepository.existsById(leadId)).thenReturn(true);
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());

        LeadInsightResponse response = leadService.getInsight(leadId);

        assertThat(response.aiAvailable()).isTrue();
        assertThat(response.message()).isEqualTo("No Bob read has been generated for this lead yet.");
        assertThat(response.summary()).isNull();
        verifyNoInteractions(aiInsightClient);
    }

    @Test
    void providerFailureIsNotReturnedAsUnavailableConfiguration() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(aiInsightClient.generate(any())).thenThrow(new AiProviderException(
                "AI insight generation failed.",
                AiProviderException.Category.PROVIDER_ERROR,
                new RuntimeException("provider failed")
        ));

        assertThatThrownBy(() -> leadService.generateInsight(leadId))
                .isInstanceOf(AiProviderException.class)
                .hasMessage("AI insight generation failed.");

        verify(aiInsightClient).generate(any());
        verify(leadInsightRepository, never()).save(any(LeadInsight.class));
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

    private static LeadInsight insight(Lead lead) {
        LeadInsight insight = new LeadInsight(
                lead,
                "Analytical Engines has a saved read.",
                "conversation is warm",
                "Send the next practical follow-up.",
                "Do not let the lead sit without a next step.",
                "test-model"
        );
        ReflectionTestUtils.setField(insight, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(insight, "generatedAt", OffsetDateTime.parse("2026-05-13T10:00:00Z"));
        return insight;
    }
}

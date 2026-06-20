package com.bob.modules.leads;

import com.bob.modules.ai.AiGeneratedInsight;
import com.bob.modules.ai.AiInsightClient;
import com.bob.modules.ai.AiProperties;
import com.bob.modules.ai.AiProviderException;
import com.bob.modules.ai.LeadInsightCache;
import com.bob.modules.ai.LeadInsightCacheEntry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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

    @Mock
    private LeadInsightCache leadInsightCache;

    private LeadService leadService;
    private AiProperties aiProperties;
    private Clock clock;

    @BeforeEach
    void setUp() {
        aiProperties = new AiProperties(true, "test-model", "test-key");
        clock = Clock.fixed(Instant.parse("2026-06-09T15:00:00Z"), ZoneOffset.UTC);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                aiProperties,
                aiInsightClient,
                leadInsightCache,
                clock
        );
    }

    @Test
    void createsLeadWithNextFollowUpAt() {
        OffsetDateTime nextFollowUpAt = OffsetDateTime.parse("2026-06-09T20:00:00Z");
        when(leadRepository.save(any(Lead.class))).thenAnswer(invocation -> {
            Lead lead = invocation.getArgument(0);
            ReflectionTestUtils.setField(lead, "id", UUID.randomUUID());
            ReflectionTestUtils.setField(lead, "createdAt", OffsetDateTime.parse("2026-06-01T10:00:00Z"));
            ReflectionTestUtils.setField(lead, "updatedAt", OffsetDateTime.parse("2026-06-01T10:00:00Z"));
            return lead;
        });

        LeadResponse response = leadService.create(new CreateLeadRequest(
                " Ada Lovelace ",
                " ada@example.com ",
                " Analytical Engines ",
                LeadStatus.NEW,
                nextFollowUpAt
        ));

        assertThat(response.name()).isEqualTo("Ada Lovelace");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.company()).isEqualTo("Analytical Engines");
        assertThat(response.nextFollowUpAt()).isEqualTo(nextFollowUpAt);

        ArgumentCaptor<Lead> leadCaptor = ArgumentCaptor.forClass(Lead.class);
        verify(leadRepository).save(leadCaptor.capture());
        assertThat(leadCaptor.getValue().getNextFollowUpAt()).isEqualTo(nextFollowUpAt);
    }

    @Test
    void updatesLeadWithNextFollowUpAt() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.QUALIFIED);
        OffsetDateTime nextFollowUpAt = OffsetDateTime.parse("2026-06-10T13:00:00Z");

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

        LeadResponse response = leadService.update(leadId, new UpdateLeadRequest(
                " Ada Byron ",
                " ada@example.com ",
                " Numbers Ltd ",
                LeadStatus.QUALIFIED,
                nextFollowUpAt
        ));

        assertThat(response.name()).isEqualTo("Ada Byron");
        assertThat(response.email()).isEqualTo("ada@example.com");
        assertThat(response.company()).isEqualTo("Numbers Ltd");
        assertThat(response.status()).isEqualTo(LeadStatus.QUALIFIED);
        assertThat(response.nextFollowUpAt()).isEqualTo(nextFollowUpAt);
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
                LeadStatus.QUALIFIED,
                null
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
    void overdueFollowUpAppearsInAttentionQueue() {
        Lead overdue = lead(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-08T12:00:00Z")
        );
        Lead future = lead(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                LeadStatus.NEW,
                OffsetDateTime.parse("2026-06-10T12:00:00Z")
        );
        when(leadRepository.findByNextFollowUpAtIsNotNull()).thenReturn(List.of(future, overdue));

        List<LeadAttentionItemResponse> response = leadService.attentionQueue();

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().id()).isEqualTo(overdue.getId());
        assertThat(response.getFirst().signal()).isEqualTo(LeadAttentionSignal.OVERDUE_FOLLOW_UP);
        assertThat(response.getFirst().relevantAt()).isEqualTo(overdue.getNextFollowUpAt());
    }

    @Test
    void dueTodayAppearsInAttentionQueue() {
        Lead dueToday = lead(
                UUID.fromString("33333333-3333-3333-3333-333333333333"),
                LeadStatus.NEW,
                OffsetDateTime.parse("2026-06-09T20:00:00Z")
        );
        Lead tomorrow = lead(
                UUID.fromString("44444444-4444-4444-4444-444444444444"),
                LeadStatus.NEW,
                OffsetDateTime.parse("2026-06-10T09:00:00Z")
        );
        when(leadRepository.findByNextFollowUpAtIsNotNull()).thenReturn(List.of(tomorrow, dueToday));

        List<LeadAttentionItemResponse> response = leadService.attentionQueue();

        assertThat(response).hasSize(1);
        assertThat(response.getFirst().id()).isEqualTo(dueToday.getId());
        assertThat(response.getFirst().signal()).isEqualTo(LeadAttentionSignal.DUE_TODAY);
    }

    @Test
    void attentionQueueOrdersByUrgencyThenOldestRelevantTimestamp() {
        Lead dueTodayLater = lead(
                UUID.fromString("55555555-5555-5555-5555-555555555555"),
                LeadStatus.NEW,
                OffsetDateTime.parse("2026-06-09T22:00:00Z")
        );
        Lead overdueNewer = lead(
                UUID.fromString("66666666-6666-6666-6666-666666666666"),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-08T12:00:00Z")
        );
        Lead dueTodayEarlier = lead(
                UUID.fromString("77777777-7777-7777-7777-777777777777"),
                LeadStatus.NEW,
                OffsetDateTime.parse("2026-06-09T16:00:00Z")
        );
        Lead overdueOlder = lead(
                UUID.fromString("88888888-8888-8888-8888-888888888888"),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-07T12:00:00Z")
        );
        when(leadRepository.findByNextFollowUpAtIsNotNull())
                .thenReturn(List.of(dueTodayLater, overdueNewer, dueTodayEarlier, overdueOlder));

        List<LeadAttentionItemResponse> response = leadService.attentionQueue();

        assertThat(response)
                .extracting(LeadAttentionItemResponse::id)
                .containsExactly(
                        overdueOlder.getId(),
                        overdueNewer.getId(),
                        dueTodayEarlier.getId(),
                        dueTodayLater.getId()
                );
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
        Lead lead = lead(leadId, LeadStatus.NEW);
        leadService = new LeadService(
                leadRepository,
                leadNoteRepository,
                leadActivityRepository,
                leadInsightRepository,
                new AiProperties(false, "", ""),
                aiInsightClient,
                leadInsightCache,
                clock
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));

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
                aiInsightClient,
                leadInsightCache,
                clock
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
                aiInsightClient,
                leadInsightCache,
                clock
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
                aiInsightClient,
                leadInsightCache,
                clock
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
                aiInsightClient,
                leadInsightCache,
                clock
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
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
        assertThat(response.cached()).isFalse();
        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(aiInsightClient).generate(promptCaptor.capture());
        assertThat(promptCaptor.getValue()).contains("Asked for a timeline next week.");
        assertThat(promptCaptor.getValue()).contains("- nextFollowUpAt: none");
        assertThat(promptCaptor.getValue()).contains("- followUpState: no_follow_up");
        assertThat(promptCaptor.getValue()).doesNotContain("ada@example.com");
        assertThat(promptCaptor.getValue()).doesNotContain("Authorization");
        assertThat(promptCaptor.getValue()).doesNotContain("OPENAI_API_KEY");
        verify(leadInsightRepository).save(any(LeadInsight.class));
        verify(leadInsightCache).put(org.mockito.ArgumentMatchers.startsWith("lead-insight:v1:"), any());
    }

    @Test
    void generationReturnsCachedInsightWhenContextMatches() {
        UUID leadId = UUID.randomUUID();
        UUID insightId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);
        LeadInsightCacheEntry cachedEntry = new LeadInsightCacheEntry(
                insightId,
                leadId,
                "Cached summary.",
                "Cached status read.",
                "Cached next action.",
                null,
                "test-model",
                OffsetDateTime.parse("2026-06-09T14:00:00Z"),
                OffsetDateTime.parse("2026-06-09T15:00:00Z")
        );

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadInsightCache.get(org.mockito.ArgumentMatchers.startsWith("lead-insight:v1:")))
                .thenReturn(Optional.of(cachedEntry));

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.cached()).isTrue();
        assertThat(response.id()).isEqualTo(insightId);
        assertThat(response.summary()).isEqualTo("Cached summary.");
        assertThat(response.cachedAt()).isEqualTo(OffsetDateTime.parse("2026-06-09T15:00:00Z"));
        verifyNoInteractions(aiInsightClient);
        verify(leadInsightRepository, never()).save(any(LeadInsight.class));
    }

    @Test
    void forcedGenerationBypassesCachedInsight() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());
        when(aiInsightClient.generate(any())).thenReturn(new AiGeneratedInsight(
                "Fresh summary.",
                "Fresh status read.",
                "Fresh next action.",
                ""
        ));
        when(leadInsightRepository.save(any(LeadInsight.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeadInsightResponse response = leadService.generateInsight(leadId, true);

        assertThat(response.cached()).isFalse();
        assertThat(response.summary()).isEqualTo("Fresh summary.");
        verify(leadInsightCache, never()).get(any());
        verify(aiInsightClient).generate(any());
    }

    @Test
    void cacheFailureFallsBackToProviderGeneration() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.CONTACTED);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)).thenReturn(List.of());
        when(leadInsightCache.get(any())).thenThrow(new IllegalStateException("cache unavailable"));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());
        when(aiInsightClient.generate(any())).thenReturn(new AiGeneratedInsight(
                "Fallback summary.",
                "Fallback status read.",
                "Fallback next action.",
                null
        ));
        when(leadInsightRepository.save(any(LeadInsight.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeadInsightResponse response = leadService.generateInsight(leadId);

        assertThat(response.cached()).isFalse();
        assertThat(response.summary()).isEqualTo("Fallback summary.");
        verify(aiInsightClient).generate(any());
    }

    @Test
    void leadInsightPromptIncludesOverdueFollowUpContext() {
        Lead lead = lead(
                UUID.randomUUID(),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-08T12:00:00Z")
        );

        String prompt = generatedPromptFor(lead);

        assertThat(prompt).contains("- nextFollowUpAt: 2026-06-08T12:00Z");
        assertThat(prompt).contains("- followUpState: overdue_follow_up");
    }

    @Test
    void leadInsightPromptIncludesDueTodayFollowUpContext() {
        Lead lead = lead(
                UUID.randomUUID(),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-09T20:00:00Z")
        );

        String prompt = generatedPromptFor(lead);

        assertThat(prompt).contains("- nextFollowUpAt: 2026-06-09T20:00Z");
        assertThat(prompt).contains("- followUpState: due_today");
    }

    @Test
    void leadInsightPromptIncludesFutureScheduledFollowUpContext() {
        Lead lead = lead(
                UUID.randomUUID(),
                LeadStatus.CONTACTED,
                OffsetDateTime.parse("2026-06-10T13:00:00Z")
        );

        String prompt = generatedPromptFor(lead);

        assertThat(prompt).contains("- nextFollowUpAt: 2026-06-10T13:00Z");
        assertThat(prompt).contains("- followUpState: scheduled_future");
    }

    @Test
    void configuredAiIsConsideredAvailableBeforeGeneration() {
        UUID leadId = UUID.randomUUID();
        Lead lead = lead(leadId, LeadStatus.NEW);

        when(leadRepository.findById(leadId)).thenReturn(Optional.of(lead));
        when(leadInsightRepository.findByLeadId(leadId)).thenReturn(Optional.empty());

        LeadInsightResponse response = leadService.getInsight(leadId);

        assertThat(response.aiAvailable()).isTrue();
        assertThat(response.cached()).isFalse();
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

    private String generatedPromptFor(Lead lead) {
        when(leadRepository.findById(lead.getId())).thenReturn(Optional.of(lead));
        when(leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId())).thenReturn(List.of());
        when(leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId())).thenReturn(List.of());
        when(leadInsightRepository.findByLeadId(lead.getId())).thenReturn(Optional.empty());
        when(aiInsightClient.generate(any())).thenReturn(new AiGeneratedInsight(
                "Summary.",
                "Status read.",
                "Next action.",
                ""
        ));
        when(leadInsightRepository.save(any(LeadInsight.class))).thenAnswer(invocation -> invocation.getArgument(0));

        leadService.generateInsight(lead.getId());

        ArgumentCaptor<String> promptCaptor = ArgumentCaptor.forClass(String.class);
        verify(aiInsightClient).generate(promptCaptor.capture());
        return promptCaptor.getValue();
    }

    private static Lead lead(UUID id, LeadStatus status) {
        return lead(id, status, null);
    }

    private static Lead lead(UUID id, LeadStatus status, OffsetDateTime nextFollowUpAt) {
        Lead lead = new Lead("Ada Lovelace", "ada@example.com", "Analytical Engines", status, nextFollowUpAt);
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

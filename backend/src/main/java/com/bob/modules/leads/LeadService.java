package com.bob.modules.leads;

import com.bob.modules.ai.AiGeneratedInsight;
import com.bob.modules.ai.AiInsightClient;
import com.bob.modules.ai.AiProviderException;
import com.bob.modules.ai.AiProperties;
import com.bob.modules.ai.LeadInsightCache;
import com.bob.modules.ai.LeadInsightCacheEntry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
class LeadService {

    private static final Logger logger = LoggerFactory.getLogger(LeadService.class);
    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "updatedAt", "name", "status", "company");

    private final LeadRepository leadRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final LeadInsightRepository leadInsightRepository;
    private final AiProperties aiProperties;
    private final AiInsightClient aiInsightClient;
    private final LeadInsightCache leadInsightCache;
    private final Clock clock;

    LeadService(
            LeadRepository leadRepository,
            LeadNoteRepository leadNoteRepository,
            LeadActivityRepository leadActivityRepository,
            LeadInsightRepository leadInsightRepository,
            AiProperties aiProperties,
            AiInsightClient aiInsightClient,
            LeadInsightCache leadInsightCache,
            Clock clock
    ) {
        this.leadRepository = leadRepository;
        this.leadNoteRepository = leadNoteRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.leadInsightRepository = leadInsightRepository;
        this.aiProperties = aiProperties;
        this.aiInsightClient = aiInsightClient;
        this.leadInsightCache = leadInsightCache;
        this.clock = clock;
    }

    @Transactional
    LeadResponse create(CreateLeadRequest request) {
        Lead lead = new Lead(
                request.name().trim(),
                normalizeOptional(request.email()),
                normalizeOptional(request.company()),
                request.status(),
                request.nextFollowUpAt()
        );

        Lead savedLead = leadRepository.save(lead);
        addActivity(savedLead, LeadActivityType.LEAD_CREATED, "Lead created");

        return LeadResponse.from(savedLead);
    }

    @Transactional(readOnly = true)
    LeadListResponse list(int page, int size, String sort, String direction, LeadStatus status) {
        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(sortDirection(direction), allowedSort(sort))
        );

        Page<Lead> leads = status == null
                ? leadRepository.findAll(pageRequest)
                : leadRepository.findByStatus(status, pageRequest);

        return LeadListResponse.from(leads);
    }

    @Transactional(readOnly = true)
    LeadResponse get(UUID id) {
        return leadRepository.findById(id)
                .map(LeadResponse::from)
                .orElseThrow(() -> new LeadNotFoundException(id));
    }

    @Transactional
    LeadResponse update(UUID id, UpdateLeadRequest request) {
        Lead lead = findLead(id);
        LeadStatus previousStatus = lead.getStatus();
        lead.update(
                request.name().trim(),
                normalizeOptional(request.email()),
                normalizeOptional(request.company()),
                request.status(),
                request.nextFollowUpAt()
        );
        addStatusChangedActivityIfNeeded(lead, previousStatus, request.status());

        return LeadResponse.from(lead);
    }

    @Transactional(readOnly = true)
    List<LeadAttentionItemResponse> attentionQueue() {
        OffsetDateTime now = OffsetDateTime.now(clock);
        return leadRepository.findByNextFollowUpAtIsNotNull().stream()
                .map(lead -> attentionItem(lead, now))
                .flatMap(Optional::stream)
                .sorted((left, right) -> {
                    int urgencyComparison = Integer.compare(urgencyRank(left.signal()), urgencyRank(right.signal()));
                    if (urgencyComparison != 0) {
                        return urgencyComparison;
                    }
                    return left.relevantAt().compareTo(right.relevantAt());
                })
                .toList();
    }

    @Transactional
    LeadResponse changeStatus(UUID id, ChangeLeadStatusRequest request) {
        Lead lead = findLead(id);
        LeadStatus previousStatus = lead.getStatus();
        if (previousStatus == request.status()) {
            return LeadResponse.from(lead);
        }

        lead.changeStatus(request.status());
        addStatusChangedActivityIfNeeded(lead, previousStatus, request.status());

        return LeadResponse.from(lead);
    }

    @Transactional
    LeadNoteResponse addNote(UUID id, CreateLeadNoteRequest request) {
        Lead lead = findLead(id);
        LeadNote note = leadNoteRepository.save(new LeadNote(lead, request.content().trim()));
        addActivity(lead, LeadActivityType.NOTE_ADDED, "Note added");

        return LeadNoteResponse.from(note);
    }

    @Transactional(readOnly = true)
    List<LeadNoteResponse> listNotes(UUID id) {
        ensureLeadExists(id);
        return leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .map(LeadNoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    List<LeadActivityResponse> listActivities(UUID id) {
        ensureLeadExists(id);
        return leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .map(LeadActivityResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    LeadInsightResponse getInsight(UUID id) {
        Lead lead = findLead(id);
        String unavailableMessage = aiProperties.unavailableMessage();
        return leadInsightRepository.findByLeadId(id)
                .map(insight -> aiProperties.configured()
                        ? cachedInsightResponse(lead).orElseGet(() -> LeadInsightResponse.from(insight))
                        : LeadInsightResponse.unavailableWithInsight(insight, unavailableMessage))
                .orElseGet(() -> aiProperties.configured()
                        ? LeadInsightResponse.empty()
                        : LeadInsightResponse.unavailable(unavailableMessage));
    }

    @Transactional
    LeadInsightResponse generateInsight(UUID id) {
        return generateInsight(id, false);
    }

    @Transactional
    LeadInsightResponse generateInsight(UUID id, boolean force) {
        Lead lead = findLead(id);
        logAiConfigState("generate", id);

        if (!aiProperties.configured()) {
            String unavailableMessage = aiProperties.unavailableMessage();
            logger.info("AI insight unavailable: leadId={} reason={}", id, unavailableReason());
            return leadInsightRepository.findByLeadId(id)
                    .map(insight -> LeadInsightResponse.unavailableWithInsight(insight, unavailableMessage))
                    .orElseGet(() -> LeadInsightResponse.unavailable(unavailableMessage));
        }

        List<LeadNote> notes = leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .limit(8)
                .toList();
        List<LeadActivity> activities = leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .limit(8)
                .toList();

        String leadContext = buildLeadContext(lead, notes, activities);
        String cacheKey = cacheKey(lead, leadContext);
        if (!force) {
            Optional<LeadInsightResponse> cachedInsight = cachedInsightResponse(cacheKey);
            if (cachedInsight.isPresent()) {
                logger.info("AI insight cache hit: leadId={} model={}", id, aiProperties.normalizedModel());
                return cachedInsight.get();
            }
            logger.info("AI insight cache miss: leadId={} model={}", id, aiProperties.normalizedModel());
        } else {
            logger.info("AI insight cache bypassed: leadId={} model={}", id, aiProperties.normalizedModel());
        }

        AiGeneratedInsight generatedInsight;
        try {
            generatedInsight = aiInsightClient.generate(leadContext);
        } catch (AiProviderException exception) {
            logger.warn(
                    "AI insight generation failed: leadId={} category={} model={}",
                    id,
                    exception.category(),
                    aiProperties.normalizedModel()
            );
            throw exception;
        }
        LeadInsight insight = leadInsightRepository.findByLeadId(id)
                .orElseGet(() -> new LeadInsight(
                        lead,
                        generatedInsight.summary(),
                        generatedInsight.statusRead(),
                        generatedInsight.nextAction(),
                        generatedInsight.attention(),
                        aiProperties.normalizedModel()
                ));
        insight.update(
                truncate(generatedInsight.summary(), 500),
                truncate(generatedInsight.statusRead(), 300),
                truncate(generatedInsight.nextAction(), 500),
                truncate(generatedInsight.attention(), 500),
                truncate(aiProperties.normalizedModel(), 120)
        );

        LeadInsight savedInsight = leadInsightRepository.save(insight);
        cacheInsight(cacheKey, savedInsight);
        logger.info("AI insight saved: leadId={} insightId={} model={}", id, savedInsight.getId(), savedInsight.getModel());
        return LeadInsightResponse.from(savedInsight);
    }

    private Optional<LeadInsightResponse> cachedInsightResponse(Lead lead) {
        List<LeadNote> notes = leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId()).stream()
                .limit(8)
                .toList();
        List<LeadActivity> activities = leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId()).stream()
                .limit(8)
                .toList();

        return cachedInsightResponse(cacheKey(lead, buildLeadContext(lead, notes, activities)));
    }

    private Optional<LeadInsightResponse> cachedInsightResponse(String cacheKey) {
        try {
            return leadInsightCache.get(cacheKey).map(LeadInsightResponse::cached);
        } catch (RuntimeException exception) {
            logger.warn("AI insight cache read failed; falling back to saved/generated insight.");
            return Optional.empty();
        }
    }

    private void cacheInsight(String cacheKey, LeadInsight insight) {
        try {
            leadInsightCache.put(cacheKey, new LeadInsightCacheEntry(
                    insight.getId(),
                    insight.getLead().getId(),
                    insight.getSummary(),
                    insight.getStatusRead(),
                    insight.getNextAction(),
                    insight.getAttention(),
                    insight.getModel(),
                    insight.getGeneratedAt(),
                    OffsetDateTime.now(clock)
            ));
        } catch (RuntimeException exception) {
            logger.warn("AI insight cache write failed; continuing without cached insight.");
        }
    }

    private void logAiConfigState(String operation, UUID leadId) {
        logger.info(
                "AI insight config state: operation={} leadId={} enabled={} modelPresent={} apiKeyPresent={} model={}",
                operation,
                leadId,
                aiProperties.enabled(),
                present(aiProperties.model()),
                present(aiProperties.openaiApiKey()),
                aiProperties.normalizedModel()
        );
    }

    private String unavailableReason() {
        if (!aiProperties.enabled()) {
            return "disabled";
        }
        if (!present(aiProperties.openaiApiKey())) {
            return "missing_api_key";
        }
        if (!present(aiProperties.model())) {
            return "missing_model";
        }
        return "unknown";
    }

    private Lead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new LeadNotFoundException(id));
    }

    private void ensureLeadExists(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new LeadNotFoundException(id);
        }
    }

    private void addActivity(Lead lead, LeadActivityType type, String description) {
        leadActivityRepository.save(new LeadActivity(lead, type, description));
    }

    private void addStatusChangedActivityIfNeeded(Lead lead, LeadStatus previousStatus, LeadStatus status) {
        if (previousStatus != status) {
            addActivity(
                    lead,
                    LeadActivityType.STATUS_CHANGED,
                    "Status changed from " + previousStatus + " to " + status
            );
        }
    }

    private String buildLeadContext(Lead lead, List<LeadNote> notes, List<LeadActivity> activities) {
        StringBuilder context = new StringBuilder();
        context.append("Lead\n");
        context.append("- name: ").append(lead.getName()).append('\n');
        context.append("- company: ").append(lead.getCompany() == null ? "unknown" : lead.getCompany()).append('\n');
        context.append("- status: ").append(lead.getStatus()).append('\n');
        context.append("- createdAt: ").append(lead.getCreatedAt()).append('\n');
        context.append("- updatedAt: ").append(lead.getUpdatedAt()).append('\n');

        context.append("\nFollow-up\n");
        context.append("- nextFollowUpAt: ")
                .append(lead.getNextFollowUpAt() == null ? "none" : lead.getNextFollowUpAt())
                .append('\n');
        context.append("- followUpState: ")
                .append(followUpState(lead.getNextFollowUpAt(), OffsetDateTime.now(clock)))
                .append('\n');
        context.append("- guidance: Use follow-up timing to shape the operational read, next action, and attention signal.\n");

        context.append("\nRecent notes\n");
        if (notes.isEmpty()) {
            context.append("- none\n");
        } else {
            notes.forEach(note -> context
                    .append("- ")
                    .append(note.getCreatedAt())
                    .append(": ")
                    .append(note.getContent())
                    .append('\n'));
        }

        context.append("\nRecent activity\n");
        if (activities.isEmpty()) {
            context.append("- none\n");
        } else {
            activities.forEach(activity -> context
                    .append("- ")
                    .append(activity.getCreatedAt())
                    .append(" ")
                    .append(activity.getType())
                    .append(": ")
                    .append(activity.getDescription())
                    .append('\n'));
        }

        return context.toString();
    }

    private String cacheKey(Lead lead, String leadContext) {
        return "lead-insight:v1:%s:%s:%s".formatted(
                lead.getId(),
                aiProperties.normalizedModel(),
                sha256(leadContext)
        );
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private String followUpState(OffsetDateTime nextFollowUpAt, OffsetDateTime now) {
        if (nextFollowUpAt == null) {
            return "no_follow_up";
        }

        if (nextFollowUpAt.isBefore(now)) {
            return "overdue_follow_up";
        }
        if (nextFollowUpAt.atZoneSameInstant(clock.getZone()).toLocalDate()
                .isEqual(now.atZoneSameInstant(clock.getZone()).toLocalDate())) {
            return "due_today";
        }
        return "scheduled_future";
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Optional<LeadAttentionItemResponse> attentionItem(Lead lead, OffsetDateTime now) {
        OffsetDateTime nextFollowUpAt = lead.getNextFollowUpAt();
        return switch (followUpState(nextFollowUpAt, now)) {
            case "overdue_follow_up" -> Optional.of(LeadAttentionItemResponse.from(
                    lead,
                    LeadAttentionSignal.OVERDUE_FOLLOW_UP,
                    nextFollowUpAt
            ));
            case "due_today" -> Optional.of(LeadAttentionItemResponse.from(
                    lead,
                    LeadAttentionSignal.DUE_TODAY,
                    nextFollowUpAt
            ));
            default -> Optional.empty();
        };
    }

    private static int urgencyRank(LeadAttentionSignal signal) {
        return switch (signal) {
            case OVERDUE_FOLLOW_UP -> 0;
            case DUE_TODAY -> 1;
            case STALE -> 2;
        };
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }

    private static String allowedSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "createdAt";
        }
        if (!ALLOWED_SORTS.contains(sort)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sort);
        }
        return sort;
    }

    private static Sort.Direction sortDirection(String direction) {
        if (direction == null || direction.isBlank()) {
            return Sort.Direction.DESC;
        }
        return Sort.Direction.fromString(direction.toUpperCase(Locale.ROOT));
    }
}

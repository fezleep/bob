package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;
import com.bob.modules.ai.LeadInsightCacheEntry;

record LeadInsightResponse(
        boolean aiAvailable,
        String message,
        UUID id,
        UUID leadId,
        String summary,
        String statusRead,
        String nextAction,
        String attention,
        String model,
        OffsetDateTime generatedAt,
        boolean cached,
        OffsetDateTime cachedAt
) {

    static LeadInsightResponse unavailable(String message) {
        return new LeadInsightResponse(
                false,
                message,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null
        );
    }

    static LeadInsightResponse unavailableWithInsight(LeadInsight insight, String message) {
        return from(
                insight,
                false,
                message + " Showing the latest saved Bob read."
        );
    }

    static LeadInsightResponse empty() {
        return new LeadInsightResponse(
                true,
                "No Bob read has been generated for this lead yet.",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                null
        );
    }

    static LeadInsightResponse from(LeadInsight insight) {
        return from(insight, true, "Latest Bob read.");
    }

    static LeadInsightResponse cached(LeadInsightCacheEntry entry) {
        return new LeadInsightResponse(
                true,
                "Latest Bob read served from cache.",
                entry.id(),
                entry.leadId(),
                entry.summary(),
                entry.statusRead(),
                entry.nextAction(),
                entry.attention(),
                entry.model(),
                entry.generatedAt(),
                true,
                entry.cachedAt()
        );
    }

    private static LeadInsightResponse from(LeadInsight insight, boolean aiAvailable, String message) {
        return new LeadInsightResponse(
                aiAvailable,
                message,
                insight.getId(),
                insight.getLead().getId(),
                insight.getSummary(),
                insight.getStatusRead(),
                insight.getNextAction(),
                insight.getAttention(),
                insight.getModel(),
                insight.getGeneratedAt(),
                false,
                null
        );
    }
}

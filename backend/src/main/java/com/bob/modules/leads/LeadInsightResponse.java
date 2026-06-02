package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;

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
        OffsetDateTime generatedAt
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
                null
        );
    }

    static LeadInsightResponse from(LeadInsight insight) {
        return from(insight, true, "Latest Bob read.");
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
                insight.getGeneratedAt()
        );
    }
}

package com.bob.modules.ai;

import java.time.OffsetDateTime;
import java.util.UUID;

public record LeadInsightCacheEntry(
        UUID id,
        UUID leadId,
        String summary,
        String statusRead,
        String nextAction,
        String attention,
        String model,
        OffsetDateTime generatedAt,
        OffsetDateTime cachedAt
) {
}

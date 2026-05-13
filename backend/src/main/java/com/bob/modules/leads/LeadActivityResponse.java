package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;

record LeadActivityResponse(
        UUID id,
        UUID leadId,
        LeadActivityType type,
        String description,
        OffsetDateTime createdAt
) {

    static LeadActivityResponse from(LeadActivity activity) {
        return new LeadActivityResponse(
                activity.getId(),
                activity.getLead().getId(),
                activity.getType(),
                activity.getDescription(),
                activity.getCreatedAt()
        );
    }
}

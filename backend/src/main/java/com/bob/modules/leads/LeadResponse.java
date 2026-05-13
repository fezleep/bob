package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;

record LeadResponse(
        UUID id,
        String name,
        String email,
        String company,
        LeadStatus status,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {

    static LeadResponse from(Lead lead) {
        return new LeadResponse(
                lead.getId(),
                lead.getName(),
                lead.getEmail(),
                lead.getCompany(),
                lead.getStatus(),
                lead.getCreatedAt(),
                lead.getUpdatedAt()
        );
    }
}

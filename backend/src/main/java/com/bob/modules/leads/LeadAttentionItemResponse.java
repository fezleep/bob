package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;

record LeadAttentionItemResponse(
        UUID id,
        String name,
        String company,
        LeadStatus status,
        LeadAttentionSignal signal,
        OffsetDateTime nextFollowUpAt,
        OffsetDateTime relevantAt
) {

    static LeadAttentionItemResponse from(Lead lead, LeadAttentionSignal signal, OffsetDateTime relevantAt) {
        return new LeadAttentionItemResponse(
                lead.getId(),
                lead.getName(),
                lead.getCompany(),
                lead.getStatus(),
                signal,
                lead.getNextFollowUpAt(),
                relevantAt
        );
    }
}

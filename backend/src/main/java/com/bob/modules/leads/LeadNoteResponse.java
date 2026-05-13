package com.bob.modules.leads;

import java.time.OffsetDateTime;
import java.util.UUID;

record LeadNoteResponse(
        UUID id,
        UUID leadId,
        String content,
        OffsetDateTime createdAt
) {

    static LeadNoteResponse from(LeadNote note) {
        return new LeadNoteResponse(
                note.getId(),
                note.getLead().getId(),
                note.getContent(),
                note.getCreatedAt()
        );
    }
}

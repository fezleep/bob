package com.bob.modules.leads;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface LeadNoteRepository extends JpaRepository<LeadNote, UUID> {

    List<LeadNote> findByLeadIdOrderByCreatedAtDesc(UUID leadId);
}

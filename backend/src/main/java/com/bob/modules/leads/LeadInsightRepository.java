package com.bob.modules.leads;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

interface LeadInsightRepository extends JpaRepository<LeadInsight, UUID> {

    Optional<LeadInsight> findByLeadId(UUID leadId);
}

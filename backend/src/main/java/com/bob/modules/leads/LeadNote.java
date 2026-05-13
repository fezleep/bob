package com.bob.modules.leads;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lead_notes")
class LeadNote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected LeadNote() {
    }

    LeadNote(Lead lead, String content) {
        this.lead = lead;
        this.content = content;
    }

    @PrePersist
    void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    UUID getId() {
        return id;
    }

    Lead getLead() {
        return lead;
    }

    String getContent() {
        return content;
    }

    OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

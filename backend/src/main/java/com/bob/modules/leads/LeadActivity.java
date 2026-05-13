package com.bob.modules.leads;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "lead_activities")
class LeadActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private LeadActivityType type;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected LeadActivity() {
    }

    LeadActivity(Lead lead, LeadActivityType type, String description) {
        this.lead = lead;
        this.type = type;
        this.description = description;
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

    LeadActivityType getType() {
        return type;
    }

    String getDescription() {
        return description;
    }

    OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

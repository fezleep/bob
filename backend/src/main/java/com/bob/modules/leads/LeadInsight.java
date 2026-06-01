package com.bob.modules.leads;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "lead_insights")
class LeadInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false, length = 500)
    private String summary;

    @Column(name = "status_read", nullable = false, length = 300)
    private String statusRead;

    @Column(name = "next_action", nullable = false, length = 500)
    private String nextAction;

    @Column(length = 500)
    private String attention;

    @Column(nullable = false, length = 120)
    private String model;

    @Column(name = "generated_at", nullable = false)
    private OffsetDateTime generatedAt;

    protected LeadInsight() {
    }

    LeadInsight(Lead lead, String summary, String statusRead, String nextAction, String attention, String model) {
        this.lead = lead;
        update(summary, statusRead, nextAction, attention, model);
    }

    @PrePersist
    @PreUpdate
    void onSave() {
        generatedAt = OffsetDateTime.now();
    }

    void update(String summary, String statusRead, String nextAction, String attention, String model) {
        this.summary = summary;
        this.statusRead = statusRead;
        this.nextAction = nextAction;
        this.attention = attention;
        this.model = model;
        this.generatedAt = OffsetDateTime.now();
    }

    UUID getId() {
        return id;
    }

    Lead getLead() {
        return lead;
    }

    String getSummary() {
        return summary;
    }

    String getStatusRead() {
        return statusRead;
    }

    String getNextAction() {
        return nextAction;
    }

    String getAttention() {
        return attention;
    }

    String getModel() {
        return model;
    }

    OffsetDateTime getGeneratedAt() {
        return generatedAt;
    }
}

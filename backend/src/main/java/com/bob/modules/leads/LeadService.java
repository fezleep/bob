package com.bob.modules.leads;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
class LeadService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "updatedAt", "name", "status", "company");

    private final LeadRepository leadRepository;
    private final LeadNoteRepository leadNoteRepository;
    private final LeadActivityRepository leadActivityRepository;

    LeadService(
            LeadRepository leadRepository,
            LeadNoteRepository leadNoteRepository,
            LeadActivityRepository leadActivityRepository
    ) {
        this.leadRepository = leadRepository;
        this.leadNoteRepository = leadNoteRepository;
        this.leadActivityRepository = leadActivityRepository;
    }

    @Transactional
    LeadResponse create(CreateLeadRequest request) {
        Lead lead = new Lead(
                request.name().trim(),
                normalizeOptional(request.email()),
                normalizeOptional(request.company()),
                request.status()
        );

        Lead savedLead = leadRepository.save(lead);
        addActivity(savedLead, LeadActivityType.LEAD_CREATED, "Lead created");

        return LeadResponse.from(savedLead);
    }

    @Transactional(readOnly = true)
    LeadListResponse list(int page, int size, String sort, String direction, LeadStatus status) {
        PageRequest pageRequest = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(sortDirection(direction), allowedSort(sort))
        );

        Page<Lead> leads = status == null
                ? leadRepository.findAll(pageRequest)
                : leadRepository.findByStatus(status, pageRequest);

        return LeadListResponse.from(leads);
    }

    @Transactional(readOnly = true)
    LeadResponse get(UUID id) {
        return leadRepository.findById(id)
                .map(LeadResponse::from)
                .orElseThrow(() -> new LeadNotFoundException(id));
    }

    @Transactional
    LeadResponse update(UUID id, UpdateLeadRequest request) {
        Lead lead = findLead(id);
        LeadStatus previousStatus = lead.getStatus();
        lead.update(
                request.name().trim(),
                normalizeOptional(request.email()),
                normalizeOptional(request.company()),
                request.status()
        );
        addStatusChangedActivityIfNeeded(lead, previousStatus, request.status());

        return LeadResponse.from(lead);
    }

    @Transactional
    LeadResponse changeStatus(UUID id, ChangeLeadStatusRequest request) {
        Lead lead = findLead(id);
        LeadStatus previousStatus = lead.getStatus();
        if (previousStatus == request.status()) {
            return LeadResponse.from(lead);
        }

        lead.changeStatus(request.status());
        addStatusChangedActivityIfNeeded(lead, previousStatus, request.status());

        return LeadResponse.from(lead);
    }

    @Transactional
    LeadNoteResponse addNote(UUID id, CreateLeadNoteRequest request) {
        Lead lead = findLead(id);
        LeadNote note = leadNoteRepository.save(new LeadNote(lead, request.content().trim()));
        addActivity(lead, LeadActivityType.NOTE_ADDED, "Note added");

        return LeadNoteResponse.from(note);
    }

    @Transactional(readOnly = true)
    List<LeadNoteResponse> listNotes(UUID id) {
        ensureLeadExists(id);
        return leadNoteRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .map(LeadNoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    List<LeadActivityResponse> listActivities(UUID id) {
        ensureLeadExists(id);
        return leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(id).stream()
                .map(LeadActivityResponse::from)
                .toList();
    }

    private Lead findLead(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new LeadNotFoundException(id));
    }

    private void ensureLeadExists(UUID id) {
        if (!leadRepository.existsById(id)) {
            throw new LeadNotFoundException(id);
        }
    }

    private void addActivity(Lead lead, LeadActivityType type, String description) {
        leadActivityRepository.save(new LeadActivity(lead, type, description));
    }

    private void addStatusChangedActivityIfNeeded(Lead lead, LeadStatus previousStatus, LeadStatus status) {
        if (previousStatus != status) {
            addActivity(
                    lead,
                    LeadActivityType.STATUS_CHANGED,
                    "Status changed from " + previousStatus + " to " + status
            );
        }
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private static String allowedSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return "createdAt";
        }
        if (!ALLOWED_SORTS.contains(sort)) {
            throw new IllegalArgumentException("Unsupported sort field: " + sort);
        }
        return sort;
    }

    private static Sort.Direction sortDirection(String direction) {
        if (direction == null || direction.isBlank()) {
            return Sort.Direction.DESC;
        }
        return Sort.Direction.fromString(direction.toUpperCase(Locale.ROOT));
    }
}

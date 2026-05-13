package com.bob.modules.leads;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
class LeadService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> ALLOWED_SORTS = Set.of("createdAt", "updatedAt", "name", "status", "company");

    private final LeadRepository leadRepository;

    LeadService(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    @Transactional
    LeadResponse create(CreateLeadRequest request) {
        Lead lead = new Lead(
                request.name().trim(),
                normalizeOptional(request.email()),
                normalizeOptional(request.company()),
                request.status()
        );

        return LeadResponse.from(leadRepository.save(lead));
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

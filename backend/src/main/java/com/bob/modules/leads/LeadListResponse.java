package com.bob.modules.leads;

import org.springframework.data.domain.Page;

import java.util.List;

record LeadListResponse(
        List<LeadResponse> leads,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    static LeadListResponse from(Page<Lead> leadPage) {
        return new LeadListResponse(
                leadPage.getContent().stream()
                        .map(LeadResponse::from)
                        .toList(),
                leadPage.getNumber(),
                leadPage.getSize(),
                leadPage.getTotalElements(),
                leadPage.getTotalPages()
        );
    }
}

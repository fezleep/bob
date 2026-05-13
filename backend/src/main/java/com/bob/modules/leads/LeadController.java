package com.bob.modules.leads;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
class LeadController {

    private final LeadService leadService;

    LeadController(LeadService leadService) {
        this.leadService = leadService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    LeadResponse create(@Valid @RequestBody CreateLeadRequest request) {
        return leadService.create(request);
    }

    @GetMapping
    LeadListResponse list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) LeadStatus status
    ) {
        return leadService.list(page, size, sort, direction, status);
    }

    @GetMapping("/{id}")
    LeadResponse get(@PathVariable UUID id) {
        return leadService.get(id);
    }
}

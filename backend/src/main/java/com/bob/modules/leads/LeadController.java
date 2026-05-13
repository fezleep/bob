package com.bob.modules.leads;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
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

    @PutMapping("/{id}")
    LeadResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateLeadRequest request) {
        return leadService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    LeadResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody ChangeLeadStatusRequest request) {
        return leadService.changeStatus(id, request);
    }

    @PostMapping("/{id}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    LeadNoteResponse addNote(@PathVariable UUID id, @Valid @RequestBody CreateLeadNoteRequest request) {
        return leadService.addNote(id, request);
    }

    @GetMapping("/{id}/notes")
    List<LeadNoteResponse> listNotes(@PathVariable UUID id) {
        return leadService.listNotes(id);
    }

    @GetMapping("/{id}/activities")
    List<LeadActivityResponse> listActivities(@PathVariable UUID id) {
        return leadService.listActivities(id);
    }
}

package com.bob.modules.leads;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record CreateLeadNoteRequest(
        @NotBlank
        @Size(max = 4000)
        String content
) {
}

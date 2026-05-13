package com.bob.modules.leads;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

record UpdateLeadRequest(
        @NotBlank
        @Size(max = 200)
        String name,

        @Email
        @Size(max = 320)
        String email,

        @Size(max = 200)
        String company,

        @NotNull
        LeadStatus status
) {
}

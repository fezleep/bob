package com.bob.modules.leads;

import jakarta.validation.constraints.NotNull;

record ChangeLeadStatusRequest(
        @NotNull
        LeadStatus status
) {
}

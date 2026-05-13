package com.bob.modules.leads;

import java.util.UUID;

public class LeadNotFoundException extends RuntimeException {

    LeadNotFoundException(UUID id) {
        super("Lead not found: " + id);
    }
}

package com.bob.modules.auth;

import java.util.UUID;

record UserResponse(
        UUID id,
        String email,
        String name,
        UserRole role
) {
    static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName(), user.getRole());
    }
}

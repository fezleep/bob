package com.bob.modules.auth;

record AuthResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
}

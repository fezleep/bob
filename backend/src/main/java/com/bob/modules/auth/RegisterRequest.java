package com.bob.modules.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record RegisterRequest(
        @NotBlank(message = "Name is required.")
        @Size(max = 160, message = "Name must be 160 characters or fewer.")
        String name,

        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        @Size(max = 320, message = "Email must be 320 characters or fewer.")
        String email,

        @NotBlank(message = "Password is required.")
        @Size(min = 8, max = 120, message = "Password must be between 8 and 120 characters.")
        String password
) {
}

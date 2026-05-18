package com.bob.modules.auth;

public class UserAlreadyExistsException extends RuntimeException {

    UserAlreadyExistsException(String email) {
        super("A user already exists for " + email + ".");
    }
}

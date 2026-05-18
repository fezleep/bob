package com.bob.modules.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(email);
        }

        AppUser user = userRepository.save(new AppUser(
                email,
                request.name().trim(),
                passwordEncoder.encode(request.password()),
                UserRole.USER
        ));

        return responseFor(user);
    }

    @Transactional(readOnly = true)
    AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(() -> new AuthException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthException("Invalid email or password.");
        }

        return responseFor(user);
    }

    @Transactional(readOnly = true)
    UserResponse me(String email) {
        AppUser user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new AuthException("Authenticated user was not found."));

        return UserResponse.from(user);
    }

    static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private AuthResponse responseFor(AppUser user) {
        return new AuthResponse(
                jwtService.createToken(user),
                "Bearer",
                jwtService.expiresInSeconds(),
                UserResponse.from(user)
        );
    }
}

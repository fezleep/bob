package com.bob.modules.auth;

import com.bob.config.AuthProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final AuthProperties authProperties;
    private final SecretKey signingKey;

    JwtService(AuthProperties authProperties) {
        this.authProperties = authProperties;
        this.signingKey = Keys.hmacShaKeyFor(authProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    String createToken(AppUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(expiresInSeconds());

        return Jwts.builder()
                .subject(user.getEmail())
                .claims(Map.of(
                        "role", user.getRole().name(),
                        "name", user.getDisplayName()
                ))
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();
    }

    public String getSubject(String token) {
        return claims(token).getSubject();
    }

    long expiresInSeconds() {
        return authProperties.jwtExpirationMinutes() * 60;
    }

    private Claims claims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

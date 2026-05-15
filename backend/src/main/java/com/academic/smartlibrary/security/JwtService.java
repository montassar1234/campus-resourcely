package com.academic.smartlibrary.security;

import com.academic.smartlibrary.config.AppProperties;
import com.academic.smartlibrary.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final AppProperties appProperties;
    private final SecretKey key;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
        this.key = Keys.hmacShaKeyFor(appProperties.jwtSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String subject, UserRole role) {
        Instant now = Instant.now();
        Integer expirationHours = appProperties.jwtExpirationHours() == null ? 12 : appProperties.jwtExpirationHours();
        return Jwts.builder()
                .subject(subject)
                // These claims are enough for the filter to rebuild the user's role on each request.
                .claim("userId", userId)
                .claim("role", role.name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationHours, ChronoUnit.HOURS)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

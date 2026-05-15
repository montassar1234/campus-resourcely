package com.academic.smartlibrary.config;

import com.academic.smartlibrary.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                // The API is stateless: every protected request must carry its own JWT.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/resources", "/api/resources/**").hasAnyRole("ADMIN", "STUDENT")
                        .requestMatchers("/api/reservations/request").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reservations/student/**").hasAnyRole("ADMIN", "STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/reservations/request/student").hasRole("STUDENT")
                        .requestMatchers("/api/notifications/student/**").hasAnyRole("ADMIN", "STUDENT")
                        .requestMatchers("/api/dashboard/**", "/api/students/**", "/api/tags/**", "/api/reservations/**", "/api/notifications/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    UserDetailsService userDetailsService() {
        // Login is handled by AuthService, so Spring Security should not create a default user.
        return username -> {
            throw new UsernameNotFoundException(username);
        };
    }
}

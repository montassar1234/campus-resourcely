package com.academic.smartlibrary.controller;

import com.academic.smartlibrary.dto.request.AdminLoginRequest;
import com.academic.smartlibrary.dto.request.StudentLoginRequest;
import com.academic.smartlibrary.dto.response.AuthResponse;
import com.academic.smartlibrary.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authService.loginAdmin(request));
    }

    @PostMapping("/student/login")
    public ResponseEntity<AuthResponse> loginStudent(@Valid @RequestBody StudentLoginRequest request) {
        return ResponseEntity.ok(authService.loginStudent(request));
    }
}

package com.academic.smartlibrary.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 40, message = "Username must contain between 3 and 40 characters")
        String username,
        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,
        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 60, message = "Password must contain between 6 and 60 characters")
        String password,
        @Valid
        StudentProfileRequest profile
) {
}

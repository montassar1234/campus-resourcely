package com.academic.smartlibrary.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record StudentRequest(
        @NotBlank(message = "Username is required")
        @jakarta.validation.constraints.Size(min = 3, max = 40, message = "Username must contain between 3 and 40 characters")
        String username,
        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,
        String password,
        @Valid
        StudentProfileRequest profile
) {
}

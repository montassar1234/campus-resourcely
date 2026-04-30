package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StudentProfileRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 3, max = 100, message = "Full name must contain between 3 and 100 characters")
        String fullName,
        @NotBlank(message = "Phone is required")
        @Size(min = 8, max = 20, message = "Phone must contain between 8 and 20 characters")
        String phone,
        @NotBlank(message = "Department is required")
        @Size(min = 2, max = 80, message = "Department must contain between 2 and 80 characters")
        String department,
        @NotBlank(message = "Level is required")
        @Size(min = 2, max = 30, message = "Level must contain between 2 and 30 characters")
        String level
) {
}

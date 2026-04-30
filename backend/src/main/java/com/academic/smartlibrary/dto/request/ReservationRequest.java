package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReservationRequest(
        @NotNull(message = "Student id is required")
        Long studentId,
        @NotNull(message = "Resource id is required")
        Long resourceId,
        @Size(max = 500, message = "Purpose must not exceed 500 characters")
        String purpose
) {
}

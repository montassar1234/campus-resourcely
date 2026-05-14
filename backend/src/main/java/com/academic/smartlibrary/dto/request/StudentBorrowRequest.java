package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record StudentBorrowRequest(
        @NotNull(message = "Student id is required")
        Long studentId,
        @NotNull(message = "Resource id is required")
        Long resourceId,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @Min(value = 1, message = "Duration must be at least 1 day")
        @Max(value = 31, message = "Duration calendar span cannot exceed 31 days")
        Integer durationDays,
        @Size(max = 500, message = "Purpose must not exceed 500 characters")
        String purpose
) {
}

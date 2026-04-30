package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record ResourceRequest(
        @NotBlank(message = "Resource name is required")
        @Size(min = 2, max = 120, message = "Resource name must contain between 2 and 120 characters")
        String name,
        @NotBlank(message = "Resource type is required")
        @Size(min = 2, max = 80, message = "Resource type must contain between 2 and 80 characters")
        String type,
        @NotBlank(message = "Asset code is required")
        @Size(min = 4, max = 30, message = "Asset code must contain between 4 and 30 characters")
        String assetCode,
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,
        @NotEmpty(message = "At least one tag is required")
        Set<Long> tagIds
) {
}

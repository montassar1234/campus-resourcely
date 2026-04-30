package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResourceTagRequest(
        @NotBlank(message = "Tag name is required")
        @Size(min = 2, max = 50, message = "Tag name must contain between 2 and 50 characters")
        String name
) {
}

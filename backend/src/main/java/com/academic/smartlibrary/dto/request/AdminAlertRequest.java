package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.Size;

public record AdminAlertRequest(
        @Size(max = 500, message = "Alert message must not exceed 500 characters")
        String message
) {
}

package com.academic.smartlibrary.dto.response;

public record StudentProfileResponse(
        Long id,
        String fullName,
        String phone,
        String department,
        String level
) {
}

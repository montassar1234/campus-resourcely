package com.academic.smartlibrary.dto.response;

public record StudentResponse(
        Long id,
        String username,
        String email,
        StudentProfileResponse profile
) {
}

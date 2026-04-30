package com.academic.smartlibrary.dto.response;

public record StudentAuthResponse(
        Long id,
        String username,
        String email,
        StudentProfileResponse profile
) {
}

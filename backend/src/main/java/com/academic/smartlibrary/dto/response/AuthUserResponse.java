package com.academic.smartlibrary.dto.response;

import com.academic.smartlibrary.entity.UserRole;

public record AuthUserResponse(
        Long id,
        String username,
        String email,
        String displayName,
        UserRole role,
        StudentProfileResponse profile
) {}

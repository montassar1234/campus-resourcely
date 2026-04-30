package com.academic.smartlibrary.dto.response;

public record ResourceTagResponse(
        Long id,
        String name,
        int resourceCount
) {
}

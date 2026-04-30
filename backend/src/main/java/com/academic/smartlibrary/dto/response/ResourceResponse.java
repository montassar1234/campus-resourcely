package com.academic.smartlibrary.dto.response;

import java.util.Set;

public record ResourceResponse(
        Long id,
        String name,
        String type,
        String assetCode,
        Integer quantity,
        Set<String> tags
) {
}

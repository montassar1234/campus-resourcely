package com.academic.smartlibrary.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminLoginRequest(@NotBlank String username, @NotBlank String password) {}

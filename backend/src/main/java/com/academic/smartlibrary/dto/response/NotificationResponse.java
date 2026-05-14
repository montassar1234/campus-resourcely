package com.academic.smartlibrary.dto.response;

import com.academic.smartlibrary.entity.NotificationType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long studentId,
        Long reservationId,
        String resourceName,
        String message,
        NotificationType type,
        LocalDate notificationDate,
        LocalDateTime createdAt,
        boolean read
) {
}

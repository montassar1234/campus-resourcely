package com.academic.smartlibrary.dto.response;

import com.academic.smartlibrary.entity.ReservationStatus;
import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        Long studentId,
        String studentName,
        Long resourceId,
        String resourceName,
        LocalDate startDate,
        LocalDate endDate,
        Integer durationDays,
        Integer weekdayDurationDays,
        LocalDate checkoutDate,
        LocalDate expectedReturnDate,
        LocalDate actualReturnDate,
        String purpose,
        ReservationStatus status
) {
}

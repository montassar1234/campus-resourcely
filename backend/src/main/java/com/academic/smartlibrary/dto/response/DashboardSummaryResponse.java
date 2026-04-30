package com.academic.smartlibrary.dto.response;

public record DashboardSummaryResponse(
        long totalStudents,
        long totalResources,
        long totalTags,
        long activeReservations,
        long overdueReservations,
        long availableUnits
) {
}

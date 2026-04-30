package com.academic.smartlibrary.service;

import com.academic.smartlibrary.dto.response.DashboardSummaryResponse;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.repository.ReservationRepository;
import com.academic.smartlibrary.repository.ResourceRepository;
import com.academic.smartlibrary.repository.ResourceTagRepository;
import com.academic.smartlibrary.repository.StudentRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final StudentRepository studentRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceTagRepository resourceTagRepository;
    private final ReservationRepository reservationRepository;

    public DashboardService(
            StudentRepository studentRepository,
            ResourceRepository resourceRepository,
            ResourceTagRepository resourceTagRepository,
            ReservationRepository reservationRepository
    ) {
        this.studentRepository = studentRepository;
        this.resourceRepository = resourceRepository;
        this.resourceTagRepository = resourceTagRepository;
        this.reservationRepository = reservationRepository;
    }

    public DashboardSummaryResponse getSummary() {
        long availableUnits = resourceRepository.findAll().stream()
                .mapToLong(resource -> resource.getQuantity() == null ? 0 : resource.getQuantity())
                .sum();
        return new DashboardSummaryResponse(
                studentRepository.count(),
                resourceRepository.count(),
                resourceTagRepository.count(),
                reservationRepository.countByStatus(ReservationStatus.ACTIVE),
                reservationRepository.countByStatusAndExpectedReturnDateBefore(ReservationStatus.OVERDUE, LocalDate.now()),
                availableUnits
        );
    }
}

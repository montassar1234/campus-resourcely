package com.academic.smartlibrary.service;

import com.academic.smartlibrary.config.AppProperties;
import com.academic.smartlibrary.dto.request.ReservationRequest;
import com.academic.smartlibrary.dto.request.StudentReservationRequest;
import com.academic.smartlibrary.dto.response.ReservationResponse;
import com.academic.smartlibrary.entity.Reservation;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.entity.Resource;
import com.academic.smartlibrary.entity.Student;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.ReservationRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final StudentService studentService;
    private final ResourceService resourceService;
    private final AppProperties appProperties;

    public ReservationService(
            ReservationRepository reservationRepository,
            StudentService studentService,
            ResourceService resourceService,
            AppProperties appProperties
    ) {
        this.reservationRepository = reservationRepository;
        this.studentService = studentService;
        this.resourceService = resourceService;
        this.appProperties = appProperties;
    }

    public List<ReservationResponse> findAll() {
        refreshStatuses();
        return reservationRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ReservationResponse findById(Long id) {
        refreshStatuses();
        return toResponse(getReservationEntity(id));
    }

    public List<ReservationResponse> findByStudent(Long studentId) {
        refreshStatuses();
        return reservationRepository.findByStudentId(studentId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReservationResponse> findByStatus(ReservationStatus status) {
        refreshStatuses();
        return reservationRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ReservationResponse> findOverdue() {
        refreshStatuses();
        return reservationRepository.findByStatus(ReservationStatus.OVERDUE).stream()
                .map(this::toResponse)
                .toList();
    }

    public ReservationResponse create(ReservationRequest request) {
        Student student = studentService.getStudentEntity(request.studentId());
        Resource resource = resourceService.getResourceEntity(request.resourceId());
        return createReservation(student, resource, request.purpose());
    }

    public ReservationResponse createStudentReservation(StudentReservationRequest request) {
        Student student = studentService.createOrUpdateForReservation(request);
        Resource resource = resourceService.getResourceEntity(request.resourceId());
        return createReservation(student, resource, request.purpose());
    }

    private ReservationResponse createReservation(Student student, Resource resource, String purpose) {
        if (resource.getQuantity() <= 0) {
            throw new BusinessException("This resource is not currently available");
        }

        resource.setQuantity(resource.getQuantity() - 1);
        resourceService.save(resource);

        Reservation reservation = Reservation.builder()
                .student(student)
                .resource(resource)
                .checkoutDate(LocalDate.now())
                .expectedReturnDate(LocalDate.now().plusDays(appProperties.borrowDays()))
                .purpose(normalizePurpose(purpose))
                .status(ReservationStatus.ACTIVE)
                .build();
        return toResponse(reservationRepository.save(reservation));
    }

    public ReservationResponse markReturned(Long id) {
        Reservation reservation = getReservationEntity(id);
        if (reservation.getStatus() == ReservationStatus.RETURNED) {
            throw new BusinessException("This reservation is already marked as returned");
        }

        reservation.setActualReturnDate(LocalDate.now());
        reservation.setStatus(ReservationStatus.RETURNED);

        Resource resource = reservation.getResource();
        resource.setQuantity(resource.getQuantity() + 1);
        resourceService.save(resource);

        return toResponse(reservationRepository.save(reservation));
    }

    public void delete(Long id) {
        reservationRepository.delete(getReservationEntity(id));
    }

    public Reservation getReservationEntity(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation with id " + id + " not found"));
    }

    private void refreshStatuses() {
        List<Reservation> reservations = reservationRepository.findAll();
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.RETURNED) {
                continue;
            }
            if (reservation.getExpectedReturnDate().isBefore(LocalDate.now())) {
                reservation.setStatus(ReservationStatus.OVERDUE);
            } else {
                reservation.setStatus(ReservationStatus.ACTIVE);
            }
        }
        reservationRepository.saveAll(reservations);
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getStudent().getId(),
                reservation.getStudent().getProfile().getFullName(),
                reservation.getResource().getId(),
                reservation.getResource().getName(),
                reservation.getCheckoutDate(),
                reservation.getExpectedReturnDate(),
                reservation.getActualReturnDate(),
                reservation.getPurpose(),
                reservation.getStatus()
        );
    }

    private String normalizePurpose(String purpose) {
        if (purpose == null || purpose.isBlank()) {
            return null;
        }
        return purpose.trim();
    }
}

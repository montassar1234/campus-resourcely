package com.academic.smartlibrary.service;

import com.academic.smartlibrary.config.AppProperties;
import com.academic.smartlibrary.dto.request.ReservationRequest;
import com.academic.smartlibrary.dto.request.StudentBorrowRequest;
import com.academic.smartlibrary.dto.request.StudentReservationRequest;
import com.academic.smartlibrary.dto.response.ReservationResponse;
import com.academic.smartlibrary.entity.Reservation;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.entity.Resource;
import com.academic.smartlibrary.entity.Student;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.ReservationRepository;
import java.time.DayOfWeek;
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

    public List<ReservationResponse> findByResource(Long resourceId) {
        refreshStatuses();
        return reservationRepository.findByResourceId(resourceId).stream()
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
        return createAdminReservation(student, resource, request.startDate(), request.durationDays(), request.purpose());
    }

    public ReservationResponse createStudentReservation(StudentReservationRequest request) {
        Student student = studentService.createOrUpdateForReservation(request);
        Resource resource = resourceService.getResourceEntity(request.resourceId());
        return createPendingReservation(student, resource, request.startDate(), request.durationDays(), request.purpose());
    }

    public ReservationResponse createStudentBorrowRequest(StudentBorrowRequest request) {
        Student student = studentService.getStudentEntity(request.studentId());
        Resource resource = resourceService.getResourceEntity(request.resourceId());
        return createPendingReservation(student, resource, request.startDate(), request.durationDays(), request.purpose());
    }

    private ReservationResponse createAdminReservation(Student student, Resource resource, LocalDate startDate, Integer durationDays, String purpose) {
        int effectiveBorrowDays = effectiveDuration(durationDays);
        LocalDate normalizedStartDate = normalizeRequestedStartDate(startDate);
        List<Reservation> resourceReservations = reservationRepository.findByResourceId(resource.getId());
        ensureAvailability(resource, resourceReservations, normalizedStartDate, effectiveBorrowDays, null);
        LocalDate endDateInclusive = endDateInclusive(normalizedStartDate, effectiveBorrowDays);

        Reservation reservation = Reservation.builder()
                .student(student)
                .resource(resource)
                .startDate(normalizedStartDate)
                .durationDays(effectiveBorrowDays)
                .checkoutDate(normalizedStartDate)
                .expectedReturnDate(endDateInclusive)
                .purpose(normalizePurpose(purpose))
                .status(normalizedStartDate.isAfter(LocalDate.now()) ? ReservationStatus.APPROVED : ReservationStatus.ACTIVE)
                .build();
        if (!normalizedStartDate.isAfter(LocalDate.now())) {
            updateReservedQuantity(resource, -1);
        }
        return toResponse(reservationRepository.save(reservation));
    }

    private ReservationResponse createPendingReservation(Student student, Resource resource, LocalDate startDate, Integer durationDays, String purpose) {
        int effectiveBorrowDays = effectiveDuration(durationDays);
        LocalDate normalizedStartDate = normalizeStudentRequestedStartDate(startDate);
        ensureStudentBoundaryWeekdays(normalizedStartDate, effectiveBorrowDays);
        ensureStudentDurationWeekdayCap(normalizedStartDate, effectiveBorrowDays);
        List<Reservation> resourceReservations = reservationRepository.findByResourceId(resource.getId());
        ensureAvailability(resource, resourceReservations, normalizedStartDate, effectiveBorrowDays, null);

        Reservation reservation = Reservation.builder()
                .student(student)
                .resource(resource)
                .startDate(normalizedStartDate)
                .durationDays(effectiveBorrowDays)
                .purpose(normalizePurpose(purpose))
                .status(ReservationStatus.PENDING)
                .build();
        return toResponse(reservationRepository.save(reservation));
    }

    public ReservationResponse approve(Long id) {
        Reservation reservation = getReservationEntity(id);
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BusinessException("Only pending reservations can be approved");
        }

        Resource resource = reservation.getResource();
        LocalDate effectiveStartDate = reservation.getStartDate().isBefore(LocalDate.now()) ? LocalDate.now() : reservation.getStartDate();
        List<Reservation> resourceReservations = reservationRepository.findByResourceId(resource.getId());
        ensureAvailability(resource, resourceReservations, effectiveStartDate, reservation.getDurationDays(), reservation.getId());

        reservation.setStartDate(effectiveStartDate);
        reservation.setCheckoutDate(effectiveStartDate);
        reservation.setExpectedReturnDate(endDateInclusive(effectiveStartDate, reservation.getDurationDays()));
        reservation.setStatus(effectiveStartDate.isAfter(LocalDate.now()) ? ReservationStatus.APPROVED : ReservationStatus.ACTIVE);
        if (!effectiveStartDate.isAfter(LocalDate.now())) {
            updateReservedQuantity(resource, -1);
        }

        return toResponse(reservationRepository.save(reservation));
    }

    public ReservationResponse markReturned(Long id) {
        Reservation reservation = getReservationEntity(id);
        if (reservation.getStatus() == ReservationStatus.REJECTED) {
            throw new BusinessException("Rejected reservations cannot be marked as returned");
        }
        if (reservation.getStatus() == ReservationStatus.PENDING || reservation.getStatus() == ReservationStatus.APPROVED) {
            throw new BusinessException("This reservation must start before it can be returned");
        }
        if (reservation.getStatus() == ReservationStatus.RETURNED) {
            throw new BusinessException("This reservation is already marked as returned");
        }

        reservation.setActualReturnDate(LocalDate.now());
        reservation.setStatus(ReservationStatus.RETURNED);

        updateReservedQuantity(reservation.getResource(), 1);

        return toResponse(reservationRepository.save(reservation));
    }

    public void delete(Long id) {
        Reservation reservation = getReservationEntity(id);
        if (reservation.getActualReturnDate() == null
                && (reservation.getStatus() == ReservationStatus.ACTIVE
                || reservation.getStatus() == ReservationStatus.OVERDUE)) {
            updateReservedQuantity(reservation.getResource(), 1);
        }
        reservationRepository.delete(reservation);
    }

    public Reservation getReservationEntity(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation with id " + id + " not found"));
    }

    private void refreshStatuses() {
        LocalDate today = LocalDate.now();
        List<Reservation> reservations = reservationRepository.findAll();
        for (Reservation reservation : reservations) {
            if (reservation.getStatus() == ReservationStatus.RETURNED) {
                continue;
            }
            if (reservation.getStatus() == ReservationStatus.REJECTED) {
                continue;
            }
            if (reservation.getStatus() == ReservationStatus.PENDING) {
                if (reservation.getStartDate() != null && !reservation.getStartDate().isAfter(today)) {
                    reservation.setStatus(ReservationStatus.REJECTED);
                }
                continue;
            }
            if (reservation.getExpectedReturnDate() == null) {
                continue;
            }
            if (reservation.getExpectedReturnDate().isBefore(today)) {
                reservation.setStatus(ReservationStatus.OVERDUE);
            } else if (reservation.getStartDate().isAfter(today)) {
                reservation.setStatus(ReservationStatus.APPROVED);
            } else {
                if (reservation.getStatus() == ReservationStatus.APPROVED) {
                    updateReservedQuantity(reservation.getResource(), -1);
                }
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
                reservation.getStartDate(),
                endDateInclusive(reservation.getStartDate(), reservation.getDurationDays()),
                reservation.getDurationDays(),
                countWeekdaysInclusive(reservation.getStartDate(), reservation.getDurationDays()),
                reservation.getCheckoutDate(),
                reservation.getExpectedReturnDate(),
                reservation.getActualReturnDate(),
                reservation.getPurpose(),
                reservation.getStatus()
        );
    }

    private LocalDate endDateInclusive(LocalDate startDate, Integer durationDays) {
        if (startDate == null || durationDays == null || durationDays < 1) {
            return startDate;
        }
        return startDate.plusDays(durationDays - 1L);
    }

    private int countWeekdaysInclusive(LocalDate startDate, Integer durationDays) {
        if (startDate == null || durationDays == null || durationDays < 1) {
            return 0;
        }
        LocalDate endInclusive = endDateInclusive(startDate, durationDays);
        int weekdays = 0;
        for (LocalDate d = startDate; !d.isAfter(endInclusive); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                weekdays++;
            }
        }
        return weekdays;
    }

    private void ensureStudentBoundaryWeekdays(LocalDate startDate, int durationDays) {
        LocalDate endInclusive = endDateInclusive(startDate, durationDays);
        DayOfWeek startDay = startDate.getDayOfWeek();
        DayOfWeek endDay = endInclusive.getDayOfWeek();
        if (startDay == DayOfWeek.SATURDAY || startDay == DayOfWeek.SUNDAY
                || endDay == DayOfWeek.SATURDAY || endDay == DayOfWeek.SUNDAY) {
            throw new BusinessException("Student reservation start and end dates must be weekdays");
        }
    }

    private void ensureStudentDurationWeekdayCap(LocalDate startDate, int durationDays) {
        int weekdays = countWeekdaysInclusive(startDate, durationDays);
        if (weekdays > 7) {
            throw new BusinessException("Student reservations cannot exceed 7 weekdays (weekends are not counted)");
        }
    }

    private int effectiveDuration(Integer durationDays) {
        return durationDays == null ? appProperties.borrowDays() : durationDays;
    }

    private LocalDate normalizeRequestedStartDate(LocalDate startDate) {
        if (startDate == null) {
            return LocalDate.now();
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Start date cannot be in the past");
        }
        return startDate;
    }

    private LocalDate normalizeStudentRequestedStartDate(LocalDate startDate) {
        LocalDate normalized = normalizeRequestedStartDate(startDate);
        LocalDate earliestStudentDate = LocalDate.now().plusDays(2);
        if (normalized.isBefore(earliestStudentDate)) {
            throw new BusinessException("Students must reserve at least 2 days in advance");
        }
        return normalized;
    }

    private void ensureAvailability(
            Resource resource,
            List<Reservation> resourceReservations,
            LocalDate startDate,
            int durationDays,
            Long ignoredReservationId
    ) {
        LocalDate endDateExclusive = startDate.plusDays(durationDays);
        int totalCapacity = resolveTotalCapacity(resource, resourceReservations);

        long overlappingReservations = resourceReservations.stream()
                .filter(reservation -> ignoredReservationId == null || !reservation.getId().equals(ignoredReservationId))
                .filter(this::blocksAvailability)
                .filter(reservation -> overlaps(startDate, endDateExclusive, reservation))
                .count();

        if (overlappingReservations >= totalCapacity) {
            throw new BusinessException("This equipment is fully booked for the selected dates");
        }
    }

    private boolean blocksAvailability(Reservation reservation) {
        return reservation.getStatus() == ReservationStatus.APPROVED
                || reservation.getStatus() == ReservationStatus.ACTIVE
                || reservation.getStatus() == ReservationStatus.OVERDUE;
    }

    private boolean overlaps(LocalDate requestedStart, LocalDate requestedEndExclusive, Reservation reservation) {
        if (reservation.getStartDate() == null || reservation.getDurationDays() == null) {
            return false;
        }
        LocalDate reservationEndExclusive = reservation.getStartDate().plusDays(reservation.getDurationDays());
        return requestedStart.isBefore(reservationEndExclusive) && reservation.getStartDate().isBefore(requestedEndExclusive);
    }

    private int resolveTotalCapacity(Resource resource, List<Reservation> resourceReservations) {
        long occupiedToday = resourceReservations.stream()
                .filter(this::blocksCurrentInventory)
                .filter(reservation -> overlaps(LocalDate.now(), LocalDate.now().plusDays(1), reservation))
                .count();
        return Math.max(resource.getQuantity() + (int) occupiedToday, 1);
    }

    private boolean blocksCurrentInventory(Reservation reservation) {
        return reservation.getStatus() == ReservationStatus.ACTIVE
                || reservation.getStatus() == ReservationStatus.OVERDUE;
    }

    private void updateReservedQuantity(Resource resource, int delta) {
        resource.setQuantity(resource.getQuantity() + delta);
        resourceService.save(resource);
    }

    private String normalizePurpose(String purpose) {
        if (purpose == null || purpose.isBlank()) {
            return null;
        }
        return purpose.trim();
    }
}

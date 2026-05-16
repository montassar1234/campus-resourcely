package com.academic.smartlibrary.service;

import com.academic.smartlibrary.dto.request.AdminAlertRequest;
import com.academic.smartlibrary.dto.response.NotificationResponse;
import com.academic.smartlibrary.entity.Notification;
import com.academic.smartlibrary.entity.NotificationType;
import com.academic.smartlibrary.entity.Reservation;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.NotificationRepository;
import com.academic.smartlibrary.repository.ReservationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ReservationRepository reservationRepository;

    public NotificationService(NotificationRepository notificationRepository, ReservationRepository reservationRepository) {
        this.notificationRepository = notificationRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findByStudent(Long studentId) {
        // Request notifications are for admins, even though they are linked to the requesting student.
        return notificationRepository.findByStudentIdAndTypeNotOrderByCreatedAtDesc(
                        studentId,
                        NotificationType.RESERVATION_REQUESTED
                ).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> findAdminNotifications() {
        // The admin feed is type-based because reservation requests can come from any student.
        return notificationRepository.findByTypeOrderByCreatedAtDesc(NotificationType.RESERVATION_REQUESTED).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification with id " + id + " not found"));
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead(Long studentId) {
        return notificationRepository.markAllAsReadByStudentId(studentId, NotificationType.RESERVATION_REQUESTED);
    }

    @Transactional
    public int markAllAdminAsRead() {
        return notificationRepository.markAllAsReadByType(NotificationType.RESERVATION_REQUESTED);
    }

    @Transactional
    public int deleteForReservation(Long reservationId) {
        return notificationRepository.deleteByReservationId(reservationId);
    }

    @Transactional
    public void notifyAdminReservationRequested(Reservation reservation) {
        if (notificationRepository.existsByReservationIdAndType(
                reservation.getId(),
                NotificationType.RESERVATION_REQUESTED
        )) {
            return;
        }

        Notification notification = Notification.builder()
                .student(reservation.getStudent())
                .reservation(reservation)
                .type(NotificationType.RESERVATION_REQUESTED)
                .message(buildReservationRequestedMessage(reservation))
                .notificationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyStudentReservationApproved(Reservation reservation) {
        if (notificationRepository.existsByReservationIdAndType(
                reservation.getId(),
                NotificationType.RESERVATION_APPROVED
        )) {
            return;
        }

        Notification notification = Notification.builder()
                .student(reservation.getStudent())
                .reservation(reservation)
                .type(NotificationType.RESERVATION_APPROVED)
                .message(buildReservationApprovedMessage(reservation))
                .notificationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyStudentReservationRejected(Reservation reservation) {
        if (notificationRepository.existsByReservationIdAndType(
                reservation.getId(),
                NotificationType.RESERVATION_REJECTED
        )) {
            return;
        }

        Notification notification = Notification.builder()
                .student(reservation.getStudent())
                .reservation(reservation)
                .type(NotificationType.RESERVATION_REJECTED)
                .message(buildReservationRejectedMessage(reservation))
                .notificationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public NotificationResponse sendAdminReturnAlert(Long reservationId, AdminAlertRequest request) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation with id " + reservationId + " not found"));

        if (reservation.getStatus() == ReservationStatus.PENDING
                || reservation.getStatus() == ReservationStatus.APPROVED
                || reservation.getActualReturnDate() != null
                || reservation.getExpectedReturnDate() == null
                || !reservation.getExpectedReturnDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Admin alerts can only be sent for overdue reservations");
        }

        reservation.setStatus(ReservationStatus.OVERDUE);
        reservationRepository.save(reservation);

        String message = StringUtils.hasText(request.message())
                ? request.message().trim()
                : defaultAdminAlertMessage(reservation);

        Notification notification = Notification.builder()
                .student(reservation.getStudent())
                .reservation(reservation)
                .type(NotificationType.ADMIN_RETURN_ALERT)
                .message(message)
                .notificationDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .read(false)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendDueSoonReminders() {
        createAutomaticReminders(LocalDate.now());
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedTodayRemindersOnStartup() {
        createAutomaticReminders(LocalDate.now());
    }

    @Transactional
    public void createAutomaticReminders(LocalDate today) {
        List<Reservation> reservations = reservationRepository.findAll().stream()
                .filter(reservation -> reservation.getActualReturnDate() == null)
                .filter(reservation -> reservation.getStatus() != ReservationStatus.RETURNED)
                .filter(reservation -> reservation.getStatus() != ReservationStatus.PENDING)
                .filter(reservation -> reservation.getStatus() != ReservationStatus.REJECTED)
                .filter(reservation -> reservation.getStatus() != ReservationStatus.APPROVED)
                .filter(reservation -> reservation.getExpectedReturnDate() != null)
                .filter(reservation -> {
                    long daysRemaining = ChronoUnit.DAYS.between(today, reservation.getExpectedReturnDate());
                    return daysRemaining >= 0 && daysRemaining <= 2;
                })
                .toList();

        for (Reservation reservation : reservations) {
            boolean exists = notificationRepository.existsByReservationIdAndTypeAndNotificationDate(
                    reservation.getId(),
                    NotificationType.AUTO_RETURN_REMINDER,
                    today
            );
            if (exists) {
                continue;
            }

            long daysRemaining = ChronoUnit.DAYS.between(today, reservation.getExpectedReturnDate());
            Notification notification = Notification.builder()
                    .student(reservation.getStudent())
                    .reservation(reservation)
                    .type(NotificationType.AUTO_RETURN_REMINDER)
                    .message(buildAutoReminderMessage(reservation, daysRemaining))
                    .notificationDate(today)
                    .createdAt(LocalDateTime.now())
                    .read(false)
                    .build();
            notificationRepository.save(notification);
        }
    }

    private String buildAutoReminderMessage(Reservation reservation, long daysRemaining) {
        String timing = daysRemaining == 0
                ? "today"
                : daysRemaining == 1
                ? "tomorrow"
                : "in 2 days";
        return "Reminder: please return " + reservation.getResource().getName()
                + " " + timing + " before the borrowing limit is reached.";
    }

    private String defaultAdminAlertMessage(Reservation reservation) {
        return "Urgent return required: please bring back " + reservation.getResource().getName()
                + " as soon as possible because the borrowing deadline has passed.";
    }

    private String buildReservationRequestedMessage(Reservation reservation) {
        return reservation.getStudent().getProfile().getFullName()
                + " requested " + reservation.getResource().getName()
                + " for " + reservation.getStartDate() + ".";
    }

    private String buildReservationApprovedMessage(Reservation reservation) {
        return "Approved: your reservation for " + reservation.getResource().getName()
                + " was accepted. Pickup is scheduled for " + reservation.getStartDate() + ".";
    }

    private String buildReservationRejectedMessage(Reservation reservation) {
        return "Rejected: " + reservation.getResource().getName()
                + " is no longer available for " + reservation.getStartDate()
                + " to " + endDateInclusive(reservation) + ". Please choose another date.";
    }

    private LocalDate endDateInclusive(Reservation reservation) {
        if (reservation.getStartDate() == null || reservation.getDurationDays() == null) {
            return reservation.getStartDate();
        }
        return reservation.getStartDate().plusDays(reservation.getDurationDays() - 1L);
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getStudent().getId(),
                notification.getReservation().getId(),
                notification.getReservation().getResource().getName(),
                notification.getMessage(),
                notification.getType(),
                notification.getNotificationDate(),
                notification.getCreatedAt(),
                notification.isRead()
        );
    }
}

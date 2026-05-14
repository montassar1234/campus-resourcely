package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.Notification;
import com.academic.smartlibrary.entity.NotificationType;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    boolean existsByReservationIdAndTypeAndNotificationDate(Long reservationId, NotificationType type, LocalDate notificationDate);

    @Modifying
    @Query("update Notification n set n.read = true where n.student.id = :studentId and n.read = false")
    int markAllAsReadByStudentId(@Param("studentId") Long studentId);
}

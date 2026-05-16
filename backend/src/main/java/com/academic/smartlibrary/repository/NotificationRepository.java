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

    List<Notification> findByStudentIdAndTypeNotOrderByCreatedAtDesc(Long studentId, NotificationType type);

    List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);

    boolean existsByReservationIdAndType(Long reservationId, NotificationType type);

    boolean existsByReservationIdAndTypeAndNotificationDate(Long reservationId, NotificationType type, LocalDate notificationDate);

    @Modifying
    @Query("delete from Notification n where n.reservation.id = :reservationId")
    int deleteByReservationId(@Param("reservationId") Long reservationId);

    @Modifying
    @Query("""
            update Notification n
            set n.read = true
            where n.student.id = :studentId
              and n.type <> :excludedType
              and n.read = false
            """)
    int markAllAsReadByStudentId(@Param("studentId") Long studentId, @Param("excludedType") NotificationType excludedType);

    @Modifying
    @Query("update Notification n set n.read = true where n.type = :type and n.read = false")
    int markAllAsReadByType(@Param("type") NotificationType type);
}

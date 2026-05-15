package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.Reservation;
import com.academic.smartlibrary.entity.ReservationStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Override
    @EntityGraph(attributePaths = {"student", "student.profile", "resource"})
    List<Reservation> findAll();

    @Override
    @EntityGraph(attributePaths = {"student", "student.profile", "resource"})
    Optional<Reservation> findById(Long id);

    @EntityGraph(attributePaths = {"student", "student.profile", "resource"})
    List<Reservation> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"student", "student.profile", "resource"})
    List<Reservation> findByResourceId(Long resourceId);

    @EntityGraph(attributePaths = {"student", "student.profile", "resource"})
    List<Reservation> findByStatus(ReservationStatus status);

    long countByStatus(ReservationStatus status);

    long countByStatusAndExpectedReturnDateBefore(ReservationStatus status, LocalDate date);
}

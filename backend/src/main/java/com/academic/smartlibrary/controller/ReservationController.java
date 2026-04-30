package com.academic.smartlibrary.controller;

import com.academic.smartlibrary.dto.request.ReservationRequest;
import com.academic.smartlibrary.dto.request.StudentReservationRequest;
import com.academic.smartlibrary.dto.response.ReservationResponse;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.service.ReservationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {
        return ResponseEntity.ok(reservationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(reservationService.findByStudent(studentId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByStatus(@PathVariable ReservationStatus status) {
        return ResponseEntity.ok(reservationService.findByStatus(status));
    }

    @GetMapping("/overdue/list")
    public ResponseEntity<List<ReservationResponse>> getOverdueReservations() {
        return ResponseEntity.ok(reservationService.findOverdue());
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.create(request));
    }

    @PostMapping("/request")
    public ResponseEntity<ReservationResponse> createStudentReservation(@Valid @RequestBody StudentReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createStudentReservation(request));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<ReservationResponse> returnReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.markReturned(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        reservationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

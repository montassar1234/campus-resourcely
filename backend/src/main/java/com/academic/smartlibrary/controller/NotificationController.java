package com.academic.smartlibrary.controller;

import com.academic.smartlibrary.dto.request.AdminAlertRequest;
import com.academic.smartlibrary.dto.response.NotificationResponse;
import com.academic.smartlibrary.service.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(notificationService.findByStudent(studentId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/student/{studentId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long studentId) {
        notificationService.markAllAsRead(studentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reservations/{reservationId}/alert")
    public ResponseEntity<NotificationResponse> sendAdminAlert(
            @PathVariable Long reservationId,
            @Valid @RequestBody AdminAlertRequest request
    ) {
        return ResponseEntity.ok(notificationService.sendAdminReturnAlert(reservationId, request));
    }
}

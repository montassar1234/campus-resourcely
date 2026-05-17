# Spring Boot Defense Cheat Sheet

This note is meant to help you answer your professor quickly and accurately during the online presentation.

## 1. One-Sentence Project Pitch

TEK-UP Resourcely is a Spring Boot REST backend for managing TEK-UP equipment reservations, where students request resources and administrators approve, track, and manage the reservation lifecycle.

## 2. Why Spring Boot Here?

Use this answer:

“Spring Boot allows me to build the backend faster with auto-configuration, REST support, dependency injection, validation, JPA integration, and scheduling. It lets me focus on the business logic instead of boilerplate configuration.”

## 3. Why Not Spring MVC Views?

Use this answer:

“The frontend is separated from the backend. Spring Boot is used only as a REST API, not for server-side rendered pages. This is a decoupled architecture: the frontend consumes JSON endpoints.”

## 4. Main Layers To Explain

### Controller

Role:

- receives HTTP requests
- validates input with `@Valid`
- returns `ResponseEntity`
- delegates to services

Examples:

- `StudentController`
- `ReservationController`

### Service

Role:

- contains business logic
- decides reservation status transitions
- checks capacity and date rules
- handles approval, return, and notifications

Examples:

- `ReservationService`
- `NotificationService`

### Repository

Role:

- communicates with the database through Spring Data JPA
- hides SQL details behind interfaces

Examples:

- `StudentRepository`
- `ReservationRepository`

### DTO

Role:

- separates the API model from the entity model
- validates input
- shapes output for the frontend

Examples:

- `StudentRequest`
- `ReservationResponse`

### Entity

Role:

- maps Java classes to database tables with JPA annotations

Examples:

- `Student`
- `Reservation`
- `Notification`

## 5. Key Spring Boot Features Used

- `@SpringBootApplication`
- `@RestController`
- `@RequestMapping`
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- `@Service`
- `@Configuration`
- `@Bean`
- `@ConfigurationProperties`
- `@EnableScheduling`
- `@Scheduled`
- `@RestControllerAdvice`
- `@ExceptionHandler`
- `@Valid`
- Spring Security filter chain
- JWT authentication
- role-based access control

## 6. JPA Relations To Mention

- `Student` and `StudentProfile`: one-to-one
- `Reservation` to `Student`: many-to-one
- `Reservation` to `Resource`: many-to-one
- `Resource` and `ResourceTag`: many-to-many
- `Notification` to `Student`: many-to-one
- `Notification` to `Reservation`: many-to-one

Why this matters:

“JPA relationships model the real-world structure of the system and reduce duplication.”

## 7. Reservation Workflow To Explain

### Student request

1. Student selects equipment and a date range.
2. Frontend sends the request to the backend.
3. Backend validates rules.
4. Reservation is created as `PENDING`.

### Admin approval

1. Admin approves the request.
2. Backend checks if the selected dates still have capacity.
3. Backend sets the reservation to `APPROVED` or `ACTIVE` when capacity is available.
4. If another approved reservation already used the capacity, the request becomes `REJECTED`.
5. The student receives an approval or rejection notification.

### Return

1. Admin marks return.
2. Backend sets `actualReturnDate`.
3. Reservation becomes `RETURNED`.
4. Quantity does not change, because quantity is total capacity and availability is calculated by dates.

### Overdue

If the deadline passes and the item is not returned, the backend marks the reservation as `OVERDUE`.

## 8. Validation Rules To Mention

Student reservation rules:

- start date cannot be in the past
- student must reserve at least 2 days in advance
- start and end must be weekdays
- reservation cannot exceed 7 weekdays
- the date picker disables fully booked days
- final capacity is checked again when the admin approves the request

General validation:

- email format is validated
- required fields use `@NotBlank` or `@NotNull`
- duration uses `@Min` and `@Max`

## 9. Notification Feature

Use this answer:

“Notifications are handled in the backend. A scheduled Spring job runs every day at 8:00 AM and creates reminders for students who are close to the return deadline. Admins can also send a manual overdue alert.”

Current notification cases:

- admin receives a notification when a student creates a reservation request
- student receives a notification when the admin approves the request
- student receives a notification when the request is rejected because the date is no longer available
- student receives automatic return reminders before the deadline
- student can receive manual overdue alerts from the admin

Technical keywords:

- `@Scheduled`
- `@Transactional`
- `ApplicationReadyEvent`

## 10. Error Handling

Use this answer:

“Instead of repeating try/catch in every controller, I centralized error handling in `GlobalExceptionHandler` using `@RestControllerAdvice`. Business errors return `400`, missing resources return `404`, and validation errors return structured details for the frontend.”

## 11. Why DTOs Instead Of Returning Entities Directly?

Use this answer:

“DTOs protect the API contract. They allow me to validate input, return only the fields the frontend needs, and avoid exposing entity internals directly.”

## 12. Why Service Layer Instead Of Coding Logic In Controllers?

Use this answer:

“Controllers should stay thin. Business logic belongs in the service layer so it is reusable, easier to test, and better separated from HTTP concerns.”

## 13. Why Spring Data JPA?

Use this answer:

“Spring Data JPA reduces boilerplate for database access. I can define repositories as interfaces and let Spring generate common queries, while still keeping the code clean and readable.”

## 14. How Authentication And RBAC Work

Use this answer:

“Authentication is handled in the Spring Boot backend. Students and admins log in through `/api/auth/student/login` or `/api/auth/admin/login`. The backend creates a JWT containing the user role, then `JwtAuthenticationFilter` reads that token on every protected request. `SecurityConfig` decides which endpoints require `ADMIN` or `STUDENT` access.”

Passwords are stored with BCrypt:

“The application defines a `PasswordEncoder` bean using BCrypt. New passwords are encoded before saving, and login uses `passwordEncoder.matches(rawPassword, hashedPassword)` instead of comparing plain text.”

Important files:

- `AuthController`
- `AuthService`
- `JwtService`
- `JwtAuthenticationFilter`
- `SecurityConfig`
- `UserRole`

What to say about RBAC:

“Admin endpoints such as dashboard, students, tags, and reservation approval require the admin role. Student endpoints such as student reservation requests require the student role. This is server-side security, not only frontend hiding.”

## 15. Why XAMPP MySQL?

Use this answer:

“The project uses XAMPP MySQL so the data is persistent during the demo. Spring Data JPA and Hibernate create or update the tables from the entity model, and the repositories use the same code as they would with another SQL database.”

If asked why XAMPP MySQL instead of an in-memory database:

“An in-memory database is useful for quick tests, but the data disappears easily. For this validation I switched to XAMPP MySQL because the data stays available after restarting the backend, and the professor can inspect the tables directly in phpMyAdmin.”

## 16. Why Is There A Data Seeder?

Use this answer:

“`DataSeeder` inserts sample students, resources, tags, and reservations at startup so the application is always ready for demonstration and testing.”

## 17. Likely Professor Questions

### Question: Where is dependency injection used?

Answer:

“Services and controllers receive dependencies through constructor injection. For example, `ReservationService` receives repositories and other services through its constructor.”

### Question: How do you validate input?

Answer:

“I use Jakarta Bean Validation annotations in DTOs and activate them in controllers with `@Valid`.”

### Question: Where do you enforce the reservation rules?

Answer:

“In `ReservationService`, not in the controller. That is where date validation, availability checks, approval logic, and status changes are handled.”

### Question: How do you avoid code duplication?

Answer:

“By using layers. Controllers delegate to services, services reuse helper methods, repositories centralize persistence, and DTO mapping is handled in one place.”

### Question: How do notifications work technically?

Answer:

“Notifications are saved as `Notification` entities in MySQL. Some are created immediately by `ReservationService`, for example request, approval, and rejection notifications. Return reminders are created by a scheduled method that runs every day.”

### Question: Why does the quantity not decrease on the resource card?

Answer:

“Quantity represents the total number of units owned by TEK-UP, not a changing availability number. Availability depends on the selected dates. If a resource has quantity 3, the same date range can have at most 3 confirmed reservations.”

### Question: Why are some dates gray in the student calendar?

Answer:

“The frontend asks the backend for reservations of the selected resource. It counts only confirmed reservations: `APPROVED`, `ACTIVE`, and `OVERDUE`. When the count reaches the resource quantity for a date, that date becomes disabled.”

### Question: What happens if several students request the same resource for the same dates?

Answer:

“Pending requests can exist at the same time because the admin has not approved them yet. When the admin approves one, the backend checks capacity again. If capacity is full, the remaining overlapping pending requests are automatically rejected and students are notified.”

### Question: Where is the data saved?

Answer:

“The data is saved in the local XAMPP MySQL database named `campus_resourcely`. Hibernate creates and updates the tables from the JPA entities, and the data can be inspected in phpMyAdmin.”

### Question: How did you solve N+1 / lazy loading problems?

Answer:

“For screens that need related data, repositories use `@EntityGraph` to fetch required relations such as reservation student/profile/resource and resource tags. For tag resource counts, I use a count query instead of loading an entire lazy collection.”

### Question: What are the limitations of your project?

Answer:

“The project now hashes passwords with BCrypt. A remaining limitation is that it does not yet include production account features such as password reset, email verification, or audit logs for login attempts.”

## 18. Best Final Summary

If you need to close strongly, say:

“From a Spring Boot perspective, this project demonstrates REST API design, layered architecture, validation, JPA relationships, scheduling, centralized exception handling, and business-rule implementation in the service layer. The most important part is that the backend is not only CRUD; it manages a complete reservation workflow.”

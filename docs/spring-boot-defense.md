# Spring Boot Defense Cheat Sheet

This note is meant to help you answer your professor quickly and accurately during the online presentation.

## 1. One-Sentence Project Pitch

Campus Resourcely is a Spring Boot REST backend for managing campus equipment reservations, where students request resources and administrators approve, track, and manage the reservation lifecycle.

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
2. Backend sets the reservation to `APPROVED` or `ACTIVE`.
3. Stock is reduced only when the reservation becomes active.

### Return

1. Admin marks return.
2. Backend sets `actualReturnDate`.
3. Reservation becomes `RETURNED`.
4. Stock is increased again.

### Overdue

If the deadline passes and the item is not returned, the backend marks the reservation as `OVERDUE`.

## 8. Validation Rules To Mention

Student reservation rules:

- start date cannot be in the past
- student must reserve at least 2 days in advance
- start and end must be weekdays
- reservation cannot exceed 7 weekdays
- equipment must be available during the selected period

General validation:

- email format is validated
- required fields use `@NotBlank` or `@NotNull`
- duration uses `@Min` and `@Max`

## 9. Notification Feature

Use this answer:

“Notifications are handled in the backend. A scheduled Spring job runs every day at 8:00 AM and creates reminders for students who are close to the return deadline. Admins can also send a manual overdue alert.”

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

## 14. Why H2?

Use this answer:

“H2 is used for academic/demo simplicity. It allows fast setup, no external installation, and immediate startup. In production I would replace it with PostgreSQL or MySQL.”

## 15. Why Is There A Data Seeder?

Use this answer:

“`DataSeeder` inserts sample students, resources, tags, and reservations at startup so the application is always ready for demonstration and testing.”

## 16. Likely Professor Questions

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

“A scheduled backend method runs every day, checks reservations close to the return date, and creates `Notification` records in the database.”

### Question: What are the limitations of your project?

Answer:

“The main limitations are that admin authentication is still demo-style, H2 is in-memory, and passwords are not secured with hashing because the project is aimed at academic demonstration rather than production deployment.”

## 17. Best Final Summary

If you need to close strongly, say:

“From a Spring Boot perspective, this project demonstrates REST API design, layered architecture, validation, JPA relationships, scheduling, centralized exception handling, and business-rule implementation in the service layer. The most important part is that the backend is not only CRUD; it manages a complete reservation workflow.”

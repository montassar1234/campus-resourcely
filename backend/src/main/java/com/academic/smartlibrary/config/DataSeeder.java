package com.academic.smartlibrary.config;

import com.academic.smartlibrary.entity.AdminAccount;
import com.academic.smartlibrary.entity.Reservation;
import com.academic.smartlibrary.entity.ReservationStatus;
import com.academic.smartlibrary.entity.Resource;
import com.academic.smartlibrary.entity.ResourceTag;
import com.academic.smartlibrary.entity.Student;
import com.academic.smartlibrary.entity.StudentProfile;
import com.academic.smartlibrary.repository.AdminAccountRepository;
import com.academic.smartlibrary.repository.ReservationRepository;
import com.academic.smartlibrary.repository.ResourceRepository;
import com.academic.smartlibrary.repository.ResourceTagRepository;
import com.academic.smartlibrary.repository.StudentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedDatabase(
            StudentRepository studentRepository,
            AdminAccountRepository adminAccountRepository,
            ResourceTagRepository resourceTagRepository,
            ResourceRepository resourceRepository,
            ReservationRepository reservationRepository
    ) {
        return args -> {
            // Keep demo logins available even if the inventory data was already inserted earlier.
            if (adminAccountRepository.count() == 0) {
                adminAccountRepository.saveAll(List.of(
                    AdminAccount.builder()
                            .username("admin")
                            .password("admin123")
                            .displayName("Admin Staff")
                            .build(),
                    AdminAccount.builder()
                            .username("test")
                            .password("test")
                            .displayName("Test Admin")
                            .build()
                ));
            }

            // The rest of the seed data is inserted only once so XAMPP keeps later demo changes.
            if (studentRepository.count() > 0 || resourceTagRepository.count() > 0 || resourceRepository.count() > 0) {
                return;
            }

            ResourceTag electronics = resourceTagRepository.save(ResourceTag.builder().name("Electronics").build());
            ResourceTag media = resourceTagRepository.save(ResourceTag.builder().name("Media Lab").build());
            ResourceTag iot = resourceTagRepository.save(ResourceTag.builder().name("IoT").build());
            ResourceTag collaboration = resourceTagRepository.save(ResourceTag.builder().name("Team Work").build());

            Resource cameraKit = Resource.builder()
                    .name("Canon Content Creator Kit")
                    .type("Camera Kit")
                    .assetCode("CAM-2026-01")
                    .quantity(3)
                    .tags(Set.of(media, collaboration))
                    .build();

            Resource arduinoBox = Resource.builder()
                    .name("Arduino Prototyping Box")
                    .type("Embedded Kit")
                    .assetCode("IOT-2026-02")
                    .quantity(5)
                    .tags(Set.of(electronics, iot))
                    .build();

            Resource projector = Resource.builder()
                    .name("Portable Presentation Projector")
                    .type("Presentation Device")
                    .assetCode("PRES-2026-03")
                    .quantity(2)
                    .tags(Set.of(media, collaboration))
                    .build();

            resourceRepository.saveAll(List.of(cameraKit, arduinoBox, projector));

            Student aminah = Student.builder()
                    .username("aminah")
                    .email("aminah@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Montassar Zouaghi")
                            .phone("+21620100101")
                            .department("Computer Science")
                            .level("Level 400")
                            .build())
                    .build();

            Student david = Student.builder()
                    .username("david")
                    .email("david@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Ilyes Ouni")
                            .phone("+21622100102")
                            .department("Software Engineering")
                            .level("Level 300")
                            .build())
                    .build();

            Student meriem = Student.builder()
                    .username("mbenali")
                    .email("m.benali@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Hichem Sboui")
                            .phone("+21624100103")
                            .department("Computer Science")
                            .level("L3")
                            .build())
                    .build();

            Student yassine = Student.builder()
                    .username("yahyaoui")
                    .email("y.ahyaoui@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Yassine Ahyaoui")
                            .phone("+21625100104")
                            .department("Software Engineering")
                            .level("M1")
                            .build())
                    .build();

            Student sara = Student.builder()
                    .username("skhider")
                    .email("s.khider@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Sara Khider")
                            .phone("+21627100105")
                            .department("Networks and Systems")
                            .level("L2")
                            .build())
                    .build();

            Student nour = Student.builder()
                    .username("nmansouri")
                    .email("n.mansouri@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Nour Mansouri")
                            .phone("+21628100106")
                            .department("Embedded Systems")
                            .level("M2")
                            .build())
                    .build();

            studentRepository.saveAll(List.of(aminah, david, meriem, yassine, sara, nour));

            // Resource quantity is total capacity. Demo reservations below do not reduce it.
            Reservation activeReservation = Reservation.builder()
                    .student(aminah)
                    .resource(arduinoBox)
                    .startDate(LocalDate.now().minusDays(2))
                    .durationDays(4)
                    .checkoutDate(LocalDate.now().minusDays(2))
                    .expectedReturnDate(LocalDate.now().plusDays(2))
                    .purpose("Senior project prototyping session")
                    .status(ReservationStatus.ACTIVE)
                    .build();

            Reservation overdueReservation = Reservation.builder()
                    .student(david)
                    .resource(projector)
                    .startDate(LocalDate.now().minusDays(10))
                    .durationDays(8)
                    .checkoutDate(LocalDate.now().minusDays(10))
                    .expectedReturnDate(LocalDate.now().minusDays(2))
                    .purpose("Class presentation rehearsal")
                    .status(ReservationStatus.OVERDUE)
                    .build();

            Reservation pendingReservation = Reservation.builder()
                    .student(yassine)
                    .resource(cameraKit)
                    .startDate(LocalDate.now().plusDays(4))
                    .durationDays(5)
                    .purpose("Media club interview recording")
                    .status(ReservationStatus.PENDING)
                    .build();

            reservationRepository.saveAll(List.of(activeReservation, overdueReservation, pendingReservation));
        };
    }
}

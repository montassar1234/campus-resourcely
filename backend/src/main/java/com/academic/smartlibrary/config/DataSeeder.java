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

            Student montassar = Student.builder()
                    .username("montassar")
                    .email("montassar@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Montassar Zouaghi")
                            .phone("+21620100101")
                            .department("SDIA")
                            .level("ING-4-S-SDIA-B")
                            .build())
                    .build();

            Student ilyes = Student.builder()
                    .username("ilyes")
                    .email("ilyes@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Ilyes Ouni")
                            .phone("+21622100102")
                            .department("SDIA")
                            .level("ING-4-S-SDIA-B")
                            .build())
                    .build();

            Student hichem = Student.builder()
                    .username("hichem")
                    .email("hichem@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Hichem Sboui")
                            .phone("+21624100103")
                            .department("SDIA")
                            .level("ING-4-S-SDIA-B")
                            .build())
                    .build();

            Student yassine = Student.builder()
                    .username("yahyaoui")
                    .email("y.ahyaoui@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Yassine Ahyaoui")
                            .phone("+21625100104")
                            .department("Tronc Commun")
                            .level("ING-3-J-A")
                            .build())
                    .build();

            Student sara = Student.builder()
                    .username("skhider")
                    .email("s.khider@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Sara Khider")
                            .phone("+21627100105")
                            .department("Tronc Commun")
                            .level("ING-3-S-A")
                            .build())
                    .build();

            Student nour = Student.builder()
                    .username("nmansouri")
                    .email("n.mansouri@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Nour Mansouri")
                            .phone("+21628100106")
                            .department("CYBER")
                            .level("ING-5-J-CYBER-B")
                            .build())
                    .build();

            Student mariem = Student.builder()
                    .username("mtrabelsi")
                    .email("m.trabelsi@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Mariem Trabelsi")
                            .phone("+21629100107")
                            .department("GL")
                            .level("ING-4-J-GL-A")
                            .build())
                    .build();

            Student aziz = Student.builder()
                    .username("agharbi")
                    .email("a.gharbi@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Aziz Gharbi")
                            .phone("+21650100108")
                            .department("Tronc Commun")
                            .level("ING-3-S-B")
                            .build())
                    .build();

            Student lina = Student.builder()
                    .username("lsaidi")
                    .email("l.saidi@tek-up.tn")
                    .password("student123")
                    .profile(StudentProfile.builder()
                            .fullName("Lina Saidi")
                            .phone("+21655100109")
                            .department("SDIA")
                            .level("ING-5-S-SDIA-A")
                            .build())
                    .build();

            studentRepository.saveAll(List.of(montassar, ilyes, hichem, yassine, sara, nour, mariem, aziz, lina));

            // Resource quantity is total capacity. Demo reservations below do not reduce it.
            Reservation activeReservation = Reservation.builder()
                    .student(montassar)
                    .resource(arduinoBox)
                    .startDate(LocalDate.now().minusDays(2))
                    .durationDays(4)
                    .checkoutDate(LocalDate.now().minusDays(2))
                    .expectedReturnDate(LocalDate.now().plusDays(2))
                    .purpose("Senior project prototyping session")
                    .status(ReservationStatus.ACTIVE)
                    .build();

            Reservation overdueReservation = Reservation.builder()
                    .student(ilyes)
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

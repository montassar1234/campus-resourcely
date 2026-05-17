package com.academic.smartlibrary.service;

import com.academic.smartlibrary.dto.request.AdminLoginRequest;
import com.academic.smartlibrary.dto.request.StudentLoginRequest;
import com.academic.smartlibrary.dto.response.AuthResponse;
import com.academic.smartlibrary.dto.response.AuthUserResponse;
import com.academic.smartlibrary.dto.response.StudentProfileResponse;
import com.academic.smartlibrary.entity.AdminAccount;
import com.academic.smartlibrary.entity.Student;
import com.academic.smartlibrary.entity.StudentProfile;
import com.academic.smartlibrary.entity.UserRole;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.repository.AdminAccountRepository;
import com.academic.smartlibrary.repository.StudentRepository;
import com.academic.smartlibrary.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AdminAccountRepository adminAccountRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            AdminAccountRepository adminAccountRepository,
            StudentRepository studentRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.adminAccountRepository = adminAccountRepository;
        this.studentRepository = studentRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse loginAdmin(AdminLoginRequest request) {
        AdminAccount admin = adminAccountRepository.findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> new BusinessException("Invalid admin credentials"));
        if (!passwordMatches(request.password(), admin.getPassword())) {
            throw new BusinessException("Invalid admin credentials");
        }
        upgradeLegacyAdminPassword(admin, request.password());
        // The role is embedded in the token and enforced by SecurityConfig.
        AuthUserResponse user = new AuthUserResponse(
                admin.getId(),
                admin.getUsername(),
                "admin@tek-up.tn",
                admin.getDisplayName(),
                UserRole.ADMIN,
                null
        );
        return new AuthResponse(jwtService.generateToken(admin.getId(), admin.getUsername(), UserRole.ADMIN), user);
    }

    public AuthResponse loginStudent(StudentLoginRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));
        if (!passwordMatches(request.password(), student.getPassword())) {
            throw new BusinessException("Invalid email or password");
        }
        upgradeLegacyStudentPassword(student, request.password());
        AuthUserResponse user = new AuthUserResponse(
                student.getId(),
                student.getUsername(),
                student.getEmail(),
                student.getProfile().getFullName(),
                UserRole.STUDENT,
                toProfile(student.getProfile())
        );
        return new AuthResponse(jwtService.generateToken(student.getId(), student.getEmail(), UserRole.STUDENT), user);
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private void upgradeLegacyAdminPassword(AdminAccount admin, String rawPassword) {
        if (admin.getPassword() != null && !admin.getPassword().startsWith("$2")) {
            admin.setPassword(passwordEncoder.encode(rawPassword));
            adminAccountRepository.save(admin);
        }
    }

    private void upgradeLegacyStudentPassword(Student student, String rawPassword) {
        if (student.getPassword() != null && !student.getPassword().startsWith("$2")) {
            student.setPassword(passwordEncoder.encode(rawPassword));
            studentRepository.save(student);
        }
    }

    private StudentProfileResponse toProfile(StudentProfile profile) {
        return new StudentProfileResponse(
                profile.getId(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getDepartment(),
                profile.getLevel()
        );
    }
}

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
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminAccountRepository adminAccountRepository;
    private final StudentRepository studentRepository;
    private final JwtService jwtService;

    public AuthService(AdminAccountRepository adminAccountRepository, StudentRepository studentRepository, JwtService jwtService) {
        this.adminAccountRepository = adminAccountRepository;
        this.studentRepository = studentRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse loginAdmin(AdminLoginRequest request) {
        AdminAccount admin = adminAccountRepository.findByUsernameIgnoreCase(request.username())
                .orElseThrow(() -> new BusinessException("Invalid admin credentials"));
        if (!admin.getPassword().equals(request.password())) {
            throw new BusinessException("Invalid admin credentials");
        }
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
        if (!student.getPassword().equals(request.password())) {
            throw new BusinessException("Invalid email or password");
        }
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

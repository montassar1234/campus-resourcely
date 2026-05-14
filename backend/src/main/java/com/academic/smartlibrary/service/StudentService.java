package com.academic.smartlibrary.service;

import com.academic.smartlibrary.config.AppProperties;
import com.academic.smartlibrary.dto.request.StudentLoginRequest;
import com.academic.smartlibrary.dto.request.StudentReservationRequest;
import com.academic.smartlibrary.dto.request.StudentRequest;
import com.academic.smartlibrary.dto.response.ApiMessageResponse;
import com.academic.smartlibrary.dto.response.StudentAuthResponse;
import com.academic.smartlibrary.dto.response.StudentProfileResponse;
import com.academic.smartlibrary.dto.response.StudentResponse;
import com.academic.smartlibrary.entity.Student;
import com.academic.smartlibrary.entity.StudentProfile;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.StudentRepository;
import java.util.List;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AppProperties appProperties;

    public StudentService(StudentRepository studentRepository, AppProperties appProperties) {
        this.studentRepository = studentRepository;
        this.appProperties = appProperties;
    }

    public List<StudentResponse> findAll() {
        return studentRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public StudentResponse findById(Long id) {
        return toResponse(getStudentEntity(id));
    }

    public List<StudentResponse> search(String keyword) {
        return studentRepository.findByUsernameContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .toList();
    }

    public StudentResponse create(StudentRequest request) {
        validateUniqueStudent(request, null);
        validatePasswordForCreate(request.password());
        Student student = buildStudent(new Student(), request);
        return toResponse(studentRepository.save(student));
    }

    public StudentResponse update(Long id, StudentRequest request) {
        Student student = getStudentEntity(id);
        validateUniqueStudent(request, id);
        return toResponse(studentRepository.save(buildStudent(student, request)));
    }

    public void delete(Long id) {
        studentRepository.delete(getStudentEntity(id));
    }

    public ApiMessageResponse getMessage() {
        return new ApiMessageResponse(appProperties.message());
    }

    public StudentAuthResponse login(StudentLoginRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException("Invalid email or password"));

        if (!student.getPassword().equals(request.password())) {
            throw new BusinessException("Invalid email or password");
        }

        return toAuthResponse(student);
    }

    public Student createOrUpdateForReservation(StudentReservationRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseGet(Student::new);

        studentRepository.findByUsernameIgnoreCase(request.username()).ifPresent(existingStudent -> {
            if (student.getId() == null || !existingStudent.getId().equals(student.getId())) {
                throw new BusinessException("Username already exists");
            }
        });

        student.setUsername(request.username());
        student.setEmail(request.email());
        student.setPassword(request.password());

        StudentProfile profile = student.getProfile();
        if (profile == null) {
            profile = new StudentProfile();
        }
        profile.setFullName(request.fullName());
        profile.setPhone(request.phone());
        profile.setDepartment(request.department());
        profile.setLevel(request.level());
        profile.setStudent(student);
        student.setProfile(profile);
        return studentRepository.save(student);
    }

    public Student getStudentEntity(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with id " + id + " not found"));
    }

    private Student buildStudent(Student student, StudentRequest request) {
        student.setUsername(request.username());
        student.setEmail(request.email());
        student.setPassword(resolvePassword(student, request.password()));

        StudentProfile profile = student.getProfile();
        if (profile == null) {
            profile = new StudentProfile();
        }
        profile.setFullName(request.profile().fullName());
        profile.setPhone(request.profile().phone());
        profile.setDepartment(request.profile().department());
        profile.setLevel(request.profile().level());
        profile.setStudent(student);
        student.setProfile(profile);
        return student;
    }

    private void validatePasswordForCreate(String password) {
        if (!StringUtils.hasText(password)) {
            throw new BusinessException("Password is required");
        }
        validatePasswordLength(password.trim());
    }

    private String resolvePassword(Student student, String password) {
        if (!StringUtils.hasText(password)) {
            if (student.getId() == null) {
                throw new BusinessException("Password is required");
            }
            return student.getPassword();
        }

        String normalizedPassword = password.trim();
        validatePasswordLength(normalizedPassword);
        return normalizedPassword;
    }

    private void validatePasswordLength(String password) {
        if (password.length() < 6 || password.length() > 60) {
            throw new BusinessException("Password must contain between 6 and 60 characters");
        }
    }

    private void validateUniqueStudent(StudentRequest request, Long currentId) {
        studentRepository.findByEmail(request.email()).ifPresent(student -> {
            if (!student.getId().equals(currentId)) {
                throw new BusinessException("Email already exists");
            }
        });

        if (studentRepository.existsByUsernameIgnoreCase(request.username())) {
            studentRepository.findByUsernameContainingIgnoreCase(request.username()).stream()
                    .filter(student -> student.getUsername().equalsIgnoreCase(request.username()))
                    .findFirst()
                    .ifPresent(student -> {
                        if (!student.getId().equals(currentId)) {
                            throw new BusinessException("Username already exists");
                        }
                    });
        }
    }

    private StudentResponse toResponse(Student student) {
        StudentProfileResponse profileResponse = toProfileResponse(student.getProfile());
        return new StudentResponse(
                student.getId(),
                student.getUsername(),
                student.getEmail(),
                profileResponse
        );
    }

    private StudentAuthResponse toAuthResponse(Student student) {
        return new StudentAuthResponse(
                student.getId(),
                student.getUsername(),
                student.getEmail(),
                toProfileResponse(student.getProfile())
        );
    }

    private StudentProfileResponse toProfileResponse(StudentProfile profile) {
        return new StudentProfileResponse(
                profile.getId(),
                profile.getFullName(),
                profile.getPhone(),
                profile.getDepartment(),
                profile.getLevel()
        );
    }
}

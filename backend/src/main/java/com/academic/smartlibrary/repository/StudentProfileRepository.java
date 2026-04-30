package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.StudentProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByStudentId(Long studentId);

    List<StudentProfile> findByFullNameContainingIgnoreCase(String fullName);
}

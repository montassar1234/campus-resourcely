package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.Student;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);

    Optional<Student> findByUsernameIgnoreCase(String username);

    List<Student> findByUsernameContainingIgnoreCase(String keyword);

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);
}

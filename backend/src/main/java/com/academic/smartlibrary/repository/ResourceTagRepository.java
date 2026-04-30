package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.ResourceTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceTagRepository extends JpaRepository<ResourceTag, Long> {
    List<ResourceTag> findByNameContainingIgnoreCase(String keyword);

    boolean existsByNameIgnoreCase(String name);
}

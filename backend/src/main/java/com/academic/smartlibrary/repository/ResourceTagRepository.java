package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.ResourceTag;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceTagRepository extends JpaRepository<ResourceTag, Long> {
    List<ResourceTag> findByNameContainingIgnoreCase(String keyword);

    boolean existsByNameIgnoreCase(String name);

    @Query("select count(r) from Resource r join r.tags t where t.id = :tagId")
    int countResourcesByTagId(Long tagId);
}

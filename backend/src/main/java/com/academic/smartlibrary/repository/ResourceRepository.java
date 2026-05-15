package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.Resource;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    @Override
    @EntityGraph(attributePaths = "tags")
    List<Resource> findAll();

    @Override
    @EntityGraph(attributePaths = "tags")
    Optional<Resource> findById(Long id);

    @EntityGraph(attributePaths = "tags")
    List<Resource> findByTypeContainingIgnoreCase(String type);

    @EntityGraph(attributePaths = "tags")
    List<Resource> findByQuantityGreaterThan(Integer quantity);

    boolean existsByAssetCode(String assetCode);

    @Query("select distinct r from Resource r join r.tags t where lower(t.name) = lower(:name)")
    @EntityGraph(attributePaths = "tags")
    List<Resource> findByTagName(String name);
}

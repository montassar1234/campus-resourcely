package com.academic.smartlibrary.repository;

import com.academic.smartlibrary.entity.Resource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByTypeContainingIgnoreCase(String type);

    List<Resource> findByQuantityGreaterThan(Integer quantity);

    boolean existsByAssetCode(String assetCode);

    @Query("select distinct r from Resource r join r.tags t where lower(t.name) = lower(:name)")
    List<Resource> findByTagName(String name);
}

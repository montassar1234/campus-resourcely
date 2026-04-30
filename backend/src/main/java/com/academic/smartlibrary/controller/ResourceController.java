package com.academic.smartlibrary.controller;

import com.academic.smartlibrary.dto.request.ResourceRequest;
import com.academic.smartlibrary.dto.response.ResourceResponse;
import com.academic.smartlibrary.service.ResourceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.findById(id));
    }

    @GetMapping("/search/type")
    public ResponseEntity<List<ResourceResponse>> getResourcesByType(@RequestParam String type) {
        return ResponseEntity.ok(resourceService.findByType(type));
    }

    @GetMapping("/search/tag")
    public ResponseEntity<List<ResourceResponse>> getResourcesByTag(@RequestParam String name) {
        return ResponseEntity.ok(resourceService.findByTagName(name));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ResourceResponse>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.findAvailable());
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(@PathVariable Long id, @Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

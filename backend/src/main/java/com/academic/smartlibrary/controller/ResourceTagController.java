package com.academic.smartlibrary.controller;

import com.academic.smartlibrary.dto.request.ResourceTagRequest;
import com.academic.smartlibrary.dto.response.ResourceTagResponse;
import com.academic.smartlibrary.service.ResourceTagService;
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
@RequestMapping("/api/tags")
public class ResourceTagController {

    private final ResourceTagService resourceTagService;

    public ResourceTagController(ResourceTagService resourceTagService) {
        this.resourceTagService = resourceTagService;
    }

    @GetMapping
    public ResponseEntity<List<ResourceTagResponse>> getAllTags() {
        return ResponseEntity.ok(resourceTagService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceTagResponse> getTagById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceTagService.findById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ResourceTagResponse>> searchTags(@RequestParam String keyword) {
        return ResponseEntity.ok(resourceTagService.search(keyword));
    }

    @PostMapping
    public ResponseEntity<ResourceTagResponse> createTag(@Valid @RequestBody ResourceTagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceTagService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceTagResponse> updateTag(@PathVariable Long id, @Valid @RequestBody ResourceTagRequest request) {
        return ResponseEntity.ok(resourceTagService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        resourceTagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

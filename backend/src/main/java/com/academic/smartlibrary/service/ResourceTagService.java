package com.academic.smartlibrary.service;

import com.academic.smartlibrary.dto.request.ResourceTagRequest;
import com.academic.smartlibrary.dto.response.ResourceTagResponse;
import com.academic.smartlibrary.entity.ResourceTag;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.ResourceTagRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResourceTagService {

    private final ResourceTagRepository resourceTagRepository;

    public ResourceTagService(ResourceTagRepository resourceTagRepository) {
        this.resourceTagRepository = resourceTagRepository;
    }

    public List<ResourceTagResponse> findAll() {
        return resourceTagRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceTagResponse> search(String keyword) {
        return resourceTagRepository.findByNameContainingIgnoreCase(keyword).stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceTagResponse findById(Long id) {
        return toResponse(getTagEntity(id));
    }

    public ResourceTagResponse create(ResourceTagRequest request) {
        if (resourceTagRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessException("Tag name already exists");
        }
        ResourceTag tag = ResourceTag.builder().name(request.name()).build();
        return toResponse(resourceTagRepository.save(tag));
    }

    public ResourceTagResponse update(Long id, ResourceTagRequest request) {
        ResourceTag tag = getTagEntity(id);
        if (!tag.getName().equalsIgnoreCase(request.name()) && resourceTagRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessException("Tag name already exists");
        }
        tag.setName(request.name());
        return toResponse(resourceTagRepository.save(tag));
    }

    public void delete(Long id) {
        resourceTagRepository.delete(getTagEntity(id));
    }

    public ResourceTag getTagEntity(Long id) {
        return resourceTagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag with id " + id + " not found"));
    }

    private ResourceTagResponse toResponse(ResourceTag tag) {
        int resourceCount = resourceTagRepository.countResourcesByTagId(tag.getId());
        return new ResourceTagResponse(tag.getId(), tag.getName(), resourceCount);
    }
}

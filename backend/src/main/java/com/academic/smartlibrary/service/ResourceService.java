package com.academic.smartlibrary.service;

import com.academic.smartlibrary.dto.request.ResourceRequest;
import com.academic.smartlibrary.dto.response.ResourceResponse;
import com.academic.smartlibrary.entity.Resource;
import com.academic.smartlibrary.entity.ResourceTag;
import com.academic.smartlibrary.exception.BusinessException;
import com.academic.smartlibrary.exception.ResourceNotFoundException;
import com.academic.smartlibrary.repository.ResourceRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceTagService resourceTagService;

    public ResourceService(ResourceRepository resourceRepository, ResourceTagService resourceTagService) {
        this.resourceRepository = resourceRepository;
        this.resourceTagService = resourceTagService;
    }

    public List<ResourceResponse> findAll() {
        return resourceRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceResponse findById(Long id) {
        return toResponse(getResourceEntity(id));
    }

    public List<ResourceResponse> findByType(String type) {
        return resourceRepository.findByTypeContainingIgnoreCase(type).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceResponse> findAvailable() {
        return resourceRepository.findByQuantityGreaterThan(0).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ResourceResponse> findByTagName(String name) {
        return resourceRepository.findByTagName(name).stream()
                .map(this::toResponse)
                .toList();
    }

    public ResourceResponse create(ResourceRequest request) {
        if (resourceRepository.existsByAssetCode(request.assetCode())) {
            throw new BusinessException("Asset code already exists");
        }
        Resource resource = applyRequest(new Resource(), request);
        return toResponse(resourceRepository.save(resource));
    }

    public ResourceResponse update(Long id, ResourceRequest request) {
        Resource resource = getResourceEntity(id);
        if (!resource.getAssetCode().equals(request.assetCode()) && resourceRepository.existsByAssetCode(request.assetCode())) {
            throw new BusinessException("Asset code already exists");
        }
        return toResponse(resourceRepository.save(applyRequest(resource, request)));
    }

    public void delete(Long id) {
        resourceRepository.delete(getResourceEntity(id));
    }

    public Resource getResourceEntity(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource with id " + id + " not found"));
    }

    public void save(Resource resource) {
        resourceRepository.save(resource);
    }

    private Resource applyRequest(Resource resource, ResourceRequest request) {
        Set<ResourceTag> tags = new HashSet<>();
        for (Long tagId : request.tagIds()) {
            tags.add(resourceTagService.getTagEntity(tagId));
        }
        resource.setName(request.name());
        resource.setType(request.type());
        resource.setAssetCode(request.assetCode());
        resource.setQuantity(request.quantity());
        resource.setTags(tags);
        return resource;
    }

    private ResourceResponse toResponse(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getAssetCode(),
                resource.getQuantity(),
                resource.getTags().stream().map(ResourceTag::getName).collect(Collectors.toSet())
        );
    }
}

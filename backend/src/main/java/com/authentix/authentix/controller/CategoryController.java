package com.authentix.authentix.controller;

import com.authentix.authentix.entity.Category;
import com.authentix.authentix.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<Category> roots = categoryRepository.findByParentIdIsNullOrderByName();
        List<Map<String, Object>> result = roots.stream()
                .map(c -> Map.<String, Object>of(
                        "id", c.getId(),
                        "name", c.getName(),
                        "slug", c.getSlug()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}

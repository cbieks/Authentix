package com.authentix.authentix.controller;

import com.authentix.authentix.entity.Category;
import com.authentix.authentix.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    /**
     * List categories: roots (no parentId) or children of a parent (parentId given).
     * Each item includes id, name, slug, parentId (null for roots).
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(
            @RequestParam(required = false) Long parentId) {
        List<Category> categories;
        if (parentId == null) {
            categories = categoryRepository.findByParentIdIsNullOrderByName();
        } else {
            categories = categoryRepository.findByParentIdOrderByName(parentId);
        }
        List<Map<String, Object>> result = categories.stream()
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("name", c.getName());
                    m.put("slug", c.getSlug());
                    m.put("parentId", c.getParentId());
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Get a single category by id (e.g. to resolve parentId when editing a listing). */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(c -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", c.getId());
                    m.put("name", c.getName());
                    m.put("slug", c.getSlug());
                    m.put("parentId", c.getParentId());
                    return ResponseEntity.<Map<String, Object>>ok(m);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

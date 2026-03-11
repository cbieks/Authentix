package com.authentix.authentix.repository;

import com.authentix.authentix.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIdIsNullOrderByName();
    List<Category> findByParentIdOrderByName(Long parentId);
    Optional<Category> findBySlug(String slug);
}

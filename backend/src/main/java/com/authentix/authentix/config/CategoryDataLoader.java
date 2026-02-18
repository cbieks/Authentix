package com.authentix.authentix.config;

import com.authentix.authentix.entity.Category;
import com.authentix.authentix.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryDataLoader implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) return;
        List<Category> categories = List.of(
                Category.builder().name("Lego").slug("lego").build(),
                Category.builder().name("Trading Cards").slug("trading-cards").build(),
                Category.builder().name("Pokemon").slug("pokemon").build(),
                Category.builder().name("Sports Cards").slug("sports-cards").build(),
                Category.builder().name("Antiques").slug("antiques").build(),
                Category.builder().name("Collectibles").slug("collectibles").build()
        );
        categoryRepository.saveAll(categories);
    }
}

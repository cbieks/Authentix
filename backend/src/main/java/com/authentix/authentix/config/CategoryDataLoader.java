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

        // Root categories (parent_id = null)
        List<Category> roots = List.of(
                Category.builder().name("Trading Cards").slug("trading-cards").build(),
                Category.builder().name("Luxury").slug("luxury").build(),
                Category.builder().name("Comics").slug("comics").build(),
                Category.builder().name("Memorabilia").slug("memorabilia").build(),
                Category.builder().name("LEGO").slug("lego").build(),
                Category.builder().name("Figures").slug("figures").build(),
                Category.builder().name("Coins & Bullion").slug("coins-bullion").build(),
                Category.builder().name("Fine Art and Limited Prints").slug("fine-art-limited-prints").build(),
                Category.builder().name("Other").slug("other").build()
        );
        categoryRepository.saveAll(roots);

        // Subcategories: (name, slug, parentSlug)
        List<SubcategoryDef> subcategories = List.of(
                new SubcategoryDef("Pokemon cards", "pokemon-cards", "trading-cards"),
                new SubcategoryDef("Sports", "sports", "trading-cards"),
                new SubcategoryDef("Magic: The Gathering", "magic-the-gathering", "trading-cards"),
                new SubcategoryDef("Yu-gi-oh", "yu-gi-oh", "trading-cards"),
                new SubcategoryDef("Watches", "watches", "luxury"),
                new SubcategoryDef("Designer Bags", "designer-bags", "luxury"),
                new SubcategoryDef("Marvel", "marvel", "comics"),
                new SubcategoryDef("DC", "dc", "comics"),
                new SubcategoryDef("Autographed Items", "autographed-items", "memorabilia"),
                new SubcategoryDef("Star Wars", "star-wars", "lego"),
                new SubcategoryDef("Hot Toys", "hot-toys", "figures"),
                new SubcategoryDef("Gold Coins", "gold-coins", "coins-bullion"),
                new SubcategoryDef("Silver Coins", "silver-coins", "coins-bullion"),
                new SubcategoryDef("Rare Mint Errors", "rare-mint-errors", "coins-bullion"),
                new SubcategoryDef("Historical Currency", "historical-currency", "coins-bullion"),
                new SubcategoryDef("Rare Coins", "rare-coins", "coins-bullion"),
                new SubcategoryDef("Signed Prints", "signed-prints", "fine-art-limited-prints"),
                new SubcategoryDef("Numbered Editions", "numbered-editions", "fine-art-limited-prints")
        );

        for (SubcategoryDef sub : subcategories) {
            Long parentId = categoryRepository.findBySlug(sub.parentSlug())
                    .map(Category::getId)
                    .orElseThrow();
            Category child = Category.builder()
                    .name(sub.name())
                    .slug(sub.slug())
                    .parentId(parentId)
                    .build();
            categoryRepository.save(child);
        }
    }

    private record SubcategoryDef(String name, String slug, String parentSlug) {}
}

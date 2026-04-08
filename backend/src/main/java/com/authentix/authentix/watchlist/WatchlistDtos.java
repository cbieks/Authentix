package com.authentix.authentix.watchlist;

import java.math.BigDecimal;
import java.util.List;

public class WatchlistDtos {

    public record CreateFolderRequest(String name) {}
    public record RenameFolderRequest(String name) {}
    public record AddItemRequest(Long listingId) {}

    public record WatchlistItemDto(
        Long id,
        Long listingId,
        String title,
        BigDecimal price,
        String categoryName,
        List<String> images
    ) {}

    public record WatchlistFolderDto(
        Long id,
        String name,
        List<WatchlistItemDto> items
    ) {}
}
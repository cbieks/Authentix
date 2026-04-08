package com.authentix.authentix.watchlist;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {
    Optional<WatchlistItem> findByFolderIdAndListingId(Long folderId, Long listingId);

    List<WatchlistItem> findByUser_IdAndListing_Id(Long userId, Long listingId);

    void deleteByUser_IdAndListing_Id(Long userId, Long listingId);
}
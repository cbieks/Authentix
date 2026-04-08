package com.authentix.authentix.service;

import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.entity.Watchlist;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.UserRepository;
import com.authentix.authentix.repository.WatchlistRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.authentix.authentix.watchlist.WatchlistItemRepository;
import com.authentix.authentix.watchlist.WatchlistFolder;
import com.authentix.authentix.watchlist.WatchlistFolderRepository;
import com.authentix.authentix.watchlist.WatchlistItem;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final WatchlistFolderRepository folderRepository;

    private Long getCurrentUserId() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getUserId();
    }

    @Transactional
    public void add(Long listingId) {
        Long userId = getCurrentUserId();

        if (watchlistRepository.existsByUserIdAndListingId(userId, listingId)) return;

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        watchlistRepository.save(Watchlist.builder()
            .user(user)
            .listing(listing)
            .build());

        WatchlistFolder folder = folderRepository.findByUserIdAndNameIgnoreCase(userId, "Saved")
            .orElseGet(() -> {
                WatchlistFolder created = new WatchlistFolder();
                created.setUser(user);
                created.setName("Saved");
                return folderRepository.save(created);
            });

        boolean alreadyInFolder = watchlistItemRepository
            .findByFolderIdAndListingId(folder.getId(), listingId)
            .isPresent();

        if (!alreadyInFolder) {
            WatchlistItem item = new WatchlistItem();
            item.setUser(user);
            item.setFolder(folder);
            item.setListing(listing);
            watchlistItemRepository.save(item);
        }
    }

    @Transactional
    public void remove(Long listingId) {
        Long userId = getCurrentUserId();
        watchlistRepository.deleteByUser_IdAndListing_Id(userId, listingId);
        watchlistItemRepository.deleteByUser_IdAndListing_Id(userId, listingId);
    }

    public List<ListingDto> getMyWatchlist() {
        Long userId = getCurrentUserId();
        return watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(w -> w.getListing())
                .filter(l -> l.getStatus() != ListingStatus.REMOVED)
                .map(ListingDto::fromEntity)
                .collect(Collectors.toList());
    }

    public boolean isWatched(Long listingId) {
        Long userId = getCurrentUserId();
        return watchlistRepository.existsByUserIdAndListingId(userId, listingId);
    }
}

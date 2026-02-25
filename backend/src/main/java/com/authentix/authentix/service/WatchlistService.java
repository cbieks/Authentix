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

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getUserId();
    }

    @Transactional
    public void add(Long listingId) {
        Long userId = getCurrentUserId();
        if (watchlistRepository.existsByUserIdAndListingId(userId, listingId)) return;
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        watchlistRepository.save(Watchlist.builder()
                .user(user)
                .listing(listing)
                .build());
    }

    @Transactional
    public void remove(Long listingId) {
        Long userId = getCurrentUserId();
        watchlistRepository.deleteByUser_IdAndListing_Id(userId, listingId);
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

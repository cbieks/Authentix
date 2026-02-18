package com.authentix.authentix.service;

import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.WatchlistRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final int RECOMMENDED_SIZE = 8;

    private final ListingRepository listingRepository;
    private final WatchlistRepository watchlistRepository;

    /**
     * If listingId is set: similar listings (same category, exclude this one).
     * If no listingId: for you (from watchlist categories) or recent/popular.
     */
    public List<ListingDto> getRecommended(Long listingId) {
        Pageable limit = PageRequest.of(0, RECOMMENDED_SIZE, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (listingId != null) {
            Listing listing = listingRepository.findById(listingId).orElse(null);
            if (listing == null) return List.of();
            var page = listingRepository.findByStatusAndCategoryIdAndIdNotOrderByCreatedAtDesc(
                    ListingStatus.ACTIVE, listing.getCategory().getId(), listingId, limit);
            return page.getContent().stream().map(ListingDto::fromEntity).collect(Collectors.toList());
        }
        Long userId = getCurrentUserIdOrNull();
        if (userId != null) {
            var watchlist = watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!watchlist.isEmpty()) {
                List<Long> categoryIds = watchlist.stream()
                        .map(w -> w.getListing().getCategory().getId())
                        .distinct()
                        .limit(5)
                        .toList();
                if (!categoryIds.isEmpty()) {
                    var page = listingRepository.findByStatusAndCategoryIdInOrderByCreatedAtDesc(
                            ListingStatus.ACTIVE, categoryIds, limit);
                    return page.getContent().stream().map(ListingDto::fromEntity).collect(Collectors.toList());
                }
            }
        }
        var page = listingRepository.findByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE, limit);
        return page.getContent().stream().map(ListingDto::fromEntity).collect(Collectors.toList());
    }

    private Long getCurrentUserIdOrNull() {
        try {
            AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return auth != null ? auth.getUserId() : null;
        } catch (Exception e) {
            return null;
        }
    }
}

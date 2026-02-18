package com.authentix.authentix.controller;

import com.authentix.authentix.dto.CreateListingRequest;
import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.dto.UpdateListingRequest;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.ShippingOption;
import com.authentix.authentix.service.ListingService;
import com.authentix.authentix.service.RecommendationService;
import com.authentix.authentix.service.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final WatchlistService watchlistService;
    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<Page<ListingDto>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ShippingOption shippingOption,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(listingService.getActiveListings(categoryId, shippingOption, page, size));
    }

    @GetMapping("/recommended")
    public ResponseEntity<List<ListingDto>> recommended(@RequestParam(required = false) Long listingId) {
        return ResponseEntity.ok(recommendationService.getRecommended(listingId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ListingDto> create(@Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.ok(listingService.create(request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ListingDto> update(@PathVariable Long id, @Valid @RequestBody UpdateListingRequest request) {
        return ResponseEntity.ok(listingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        listingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<ListingDto>> getMyListings() {
        return ResponseEntity.ok(listingService.getMyListings());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingDto> setStatus(@PathVariable Long id, @RequestParam ListingStatus status) {
        return ResponseEntity.ok(listingService.setStatus(id, status));
    }

    @PostMapping("/{id}/verification")
    public ResponseEntity<ListingDto> requestVerification(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.requestVerification(id));
    }

    @PostMapping("/{id}/watchlist")
    public ResponseEntity<Void> addToWatchlist(@PathVariable Long id) {
        watchlistService.add(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/watchlist")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable Long id) {
        watchlistService.remove(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/watchlist")
    public ResponseEntity<Map<String, Boolean>> isWatched(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("watched", watchlistService.isWatched(id)));
    }
}

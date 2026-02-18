package com.authentix.authentix.service;

import com.authentix.authentix.dto.CreateListingRequest;
import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.dto.UpdateListingRequest;
import com.authentix.authentix.entity.*;
import com.authentix.authentix.repository.CategoryRepository;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.UserRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Value("${app.admin-email:}")
    private String adminEmail;

    private User getCurrentUser() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(auth.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public Page<ListingDto> getActiveListings(Long categoryId, ShippingOption shippingOption, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Listing> listings;
        if (categoryId != null && shippingOption != null) {
            listings = listingRepository.findByStatusAndCategoryIdAndShippingOptionOrderByCreatedAtDesc(ListingStatus.ACTIVE, categoryId, shippingOption, pageable);
        } else if (categoryId != null) {
            listings = listingRepository.findByStatusAndCategoryIdOrderByCreatedAtDesc(ListingStatus.ACTIVE, categoryId, pageable);
        } else if (shippingOption != null) {
            listings = listingRepository.findByStatusAndShippingOptionOrderByCreatedAtDesc(ListingStatus.ACTIVE, shippingOption, pageable);
        } else {
            listings = listingRepository.findByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE, pageable);
        }
        return listings.map(ListingDto::fromEntity);
    }

    public ListingDto getById(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (listing.getStatus() == ListingStatus.REMOVED) {
            throw new IllegalArgumentException("Listing not found");
        }
        return ListingDto.fromEntity(listing);
    }

    @Transactional
    public ListingDto create(CreateListingRequest request) {
        User seller = getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        Listing listing = Listing.builder()
                .seller(seller)
                .category(category)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .condition(request.getCondition())
                .images(request.getImages() != null ? request.getImages() : List.of())
                .status(ListingStatus.DRAFT)
                .shippingOption(request.getShippingOption() != null ? request.getShippingOption() : ShippingOption.SHIP)
                .build();
        listing = listingRepository.save(listing);
        return ListingDto.fromEntity(listing);
    }

    @Transactional
    public ListingDto update(Long id, UpdateListingRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        User current = getCurrentUser();
        if (!listing.getSeller().getId().equals(current.getId())) {
            throw new IllegalArgumentException("Not authorized to update this listing");
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            listing.setCategory(category);
        }
        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getDescription() != null) listing.setDescription(request.getDescription());
        if (request.getPrice() != null) listing.setPrice(request.getPrice());
        if (request.getCurrency() != null) listing.setCurrency(request.getCurrency());
        if (request.getCondition() != null) listing.setCondition(request.getCondition());
        if (request.getImages() != null) listing.setImages(request.getImages());
        if (request.getShippingOption() != null) listing.setShippingOption(request.getShippingOption());
        listing = listingRepository.save(listing);
        return ListingDto.fromEntity(listing);
    }

    @Transactional
    public void delete(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        User current = getCurrentUser();
        if (!listing.getSeller().getId().equals(current.getId())) {
            throw new IllegalArgumentException("Not authorized to delete this listing");
        }
        listing.setStatus(ListingStatus.REMOVED);
        listingRepository.save(listing);
    }

    public java.util.List<ListingDto> getMyListings() {
        User current = getCurrentUser();
        return listingRepository.findBySellerIdOrderByCreatedAtDesc(current.getId()).stream()
                .filter(l -> l.getStatus() != ListingStatus.REMOVED)
                .map(ListingDto::fromEntity)
                .toList();
    }

    @Transactional
    public ListingDto setStatus(Long id, ListingStatus status) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        User current = getCurrentUser();
        if (!listing.getSeller().getId().equals(current.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        listing.setStatus(status);
        listing = listingRepository.save(listing);
        return ListingDto.fromEntity(listing);
    }

    @Transactional
    public ListingDto requestVerification(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        User current = getCurrentUser();
        if (!listing.getSeller().getId().equals(current.getId())) {
            throw new IllegalArgumentException("Not authorized");
        }
        if (listing.getVerificationStatus() != VerificationStatus.UNVERIFIED) {
            throw new IllegalArgumentException("Can only request verification for unverified listings");
        }
        listing.setVerificationStatus(VerificationStatus.PENDING);
        listing = listingRepository.save(listing);
        return ListingDto.fromEntity(listing);
    }

    public boolean isAdmin() {
        User current = getCurrentUser();
        return adminEmail != null && !adminEmail.isBlank() && adminEmail.equalsIgnoreCase(current.getEmail());
    }

    @Transactional
    public ListingDto adminSetVerification(Long id, VerificationStatus status) {
        if (!isAdmin()) {
            throw new IllegalArgumentException("Admin only");
        }
        if (status != VerificationStatus.VERIFIED && status != VerificationStatus.UNVERIFIED) {
            throw new IllegalArgumentException("Admin can set only VERIFIED or UNVERIFIED");
        }
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        listing.setVerificationStatus(status);
        listing = listingRepository.save(listing);
        return ListingDto.fromEntity(listing);
    }

    public Page<ListingDto> getListingsPendingVerification(int page, int size) {
        if (!isAdmin()) {
            throw new IllegalArgumentException("Admin only");
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return listingRepository.findByVerificationStatusOrderByCreatedAtDesc(VerificationStatus.PENDING, pageable)
                .map(ListingDto::fromEntity);
    }
}

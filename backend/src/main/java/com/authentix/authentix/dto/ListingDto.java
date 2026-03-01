package com.authentix.authentix.dto;

import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.ShippingOption;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
public class ListingDto {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String description;
    private BigDecimal price;
    private String condition;
    private List<String> images;
    private ListingStatus status;
    private ShippingOption shippingOption;
    private String zipCode;
    private String city;
    private String state;
    private Long sellerId;
    private String sellerDisplayName;
    private String sellerProfilePhotoUrl;
    private boolean sellerPayoutsEnabled;
    private Instant createdAt;

    public static ListingDto fromEntity(Listing listing) {
        ListingDto dto = new ListingDto();
        dto.setId(listing.getId());
        dto.setCategoryId(listing.getCategory().getId());
        dto.setCategoryName(listing.getCategory().getName());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setCondition(listing.getCondition());
        dto.setImages(listing.getImages() != null ? List.copyOf(listing.getImages()) : List.of());
        dto.setStatus(listing.getStatus());
        dto.setShippingOption(listing.getShippingOption());
        dto.setZipCode(listing.getZipCode());
        dto.setCity(listing.getCity());
        dto.setState(listing.getState());
        dto.setSellerId(listing.getSeller().getId());
        dto.setSellerDisplayName(listing.getSeller().getDisplayName());
        dto.setSellerProfilePhotoUrl(listing.getSeller().getProfilePhotoUrl());
        dto.setSellerPayoutsEnabled(listing.getSeller().getStripeConnectAccountId() != null && !listing.getSeller().getStripeConnectAccountId().isBlank());
        dto.setCreatedAt(listing.getCreatedAt());
        return dto;
    }
}

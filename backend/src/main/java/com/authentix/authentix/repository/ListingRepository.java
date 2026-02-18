package com.authentix.authentix.repository;

import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.ShippingOption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    Page<Listing> findByStatusOrderByCreatedAtDesc(ListingStatus status, Pageable pageable);
    Page<Listing> findByStatusAndCategoryIdOrderByCreatedAtDesc(ListingStatus status, Long categoryId, Pageable pageable);
    Page<Listing> findByStatusAndShippingOptionOrderByCreatedAtDesc(ListingStatus status, ShippingOption shippingOption, Pageable pageable);
    Page<Listing> findByStatusAndCategoryIdAndShippingOptionOrderByCreatedAtDesc(ListingStatus status, Long categoryId, ShippingOption shippingOption, Pageable pageable);
    List<Listing> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    Page<Listing> findByVerificationStatusOrderByCreatedAtDesc(com.authentix.authentix.entity.VerificationStatus verificationStatus, Pageable pageable);
    Page<Listing> findByStatusAndCategoryIdAndIdNotOrderByCreatedAtDesc(ListingStatus status, Long categoryId, Long excludeId, Pageable pageable);
    Page<Listing> findByStatusAndCategoryIdInOrderByCreatedAtDesc(ListingStatus status, List<Long> categoryIds, Pageable pageable);
}

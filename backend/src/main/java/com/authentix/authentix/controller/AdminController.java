package com.authentix.authentix.controller;

import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.entity.VerificationStatus;
import com.authentix.authentix.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ListingService listingService;

    @GetMapping("/listings")
    public ResponseEntity<Page<ListingDto>> getListingsPendingVerification(
            @RequestParam(required = false) String verification,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (!"PENDING".equals(verification)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(listingService.getListingsPendingVerification(page, size));
    }

    @PatchMapping("/listings/{id}/verification")
    public ResponseEntity<ListingDto> setVerification(@PathVariable Long id, @RequestParam VerificationStatus status) {
        return ResponseEntity.ok(listingService.adminSetVerification(id, status));
    }
}

package com.authentix.authentix.controller;

import com.authentix.authentix.dto.DiscoveryLocationDto;
import com.authentix.authentix.dto.DiscoveryLocationUpdateRequest;
import com.authentix.authentix.dto.ListingDto;
import com.authentix.authentix.dto.UpdateProfileRequest;
import com.authentix.authentix.dto.UserDto;
import com.authentix.authentix.service.UserService;
import com.authentix.authentix.service.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final WatchlistService watchlistService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PatchMapping("/me")
    public ResponseEntity<UserDto> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateMe(request));
    }

    @GetMapping("/me/discovery-location")
    public ResponseEntity<DiscoveryLocationDto> getDiscoveryLocation() {
        return ResponseEntity.ok(userService.getDiscoveryLocation());
    }

    @PutMapping("/me/discovery-location")
    public ResponseEntity<DiscoveryLocationDto> updateDiscoveryLocation(@Valid @RequestBody DiscoveryLocationUpdateRequest request) {
        return ResponseEntity.ok(userService.updateDiscoveryLocation(request.getZipCode(), request.getCountry()));
    }

    @GetMapping("/me/watchlist")
    public ResponseEntity<List<ListingDto>> getMyWatchlist() {
        return ResponseEntity.ok(watchlistService.getMyWatchlist());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }
}

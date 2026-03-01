package com.authentix.authentix.service;

import com.authentix.authentix.dto.DiscoveryLocationDto;
import com.authentix.authentix.dto.UpdateProfileRequest;
import com.authentix.authentix.dto.UserDto;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.UserRepository;

import java.time.Instant;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(auth.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public UserDto getMe() {
        return UserDto.fromEntity(getCurrentUser());
    }

    @Transactional
    public UserDto updateMe(UpdateProfileRequest request) {
        User user = getCurrentUser();
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(request.getProfilePhotoUrl());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getContactInfo() != null) user.setContactInfo(request.getContactInfo());
        if (request.getContactVisible() != null) user.setContactVisible(request.getContactVisible());
        user = userRepository.save(user);
        return UserDto.fromEntity(user);
    }

    public UserDto getPublicProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserDto.fromEntity(user, user.isContactVisible());
    }

    public DiscoveryLocationDto getDiscoveryLocation() {
        User user = getCurrentUser();
        DiscoveryLocationDto dto = new DiscoveryLocationDto();
        dto.setZipCode(user.getDiscoveryZipCode());
        dto.setCountry(user.getDiscoveryCountry());
        dto.setUpdatedAt(user.getDiscoveryUpdatedAt());
        return dto;
    }

    @Transactional
    public DiscoveryLocationDto updateDiscoveryLocation(String zipCode, String country) {
        User user = getCurrentUser();
        user.setDiscoveryZipCode(zipCode != null && !zipCode.isBlank() ? zipCode.trim() : null);
        user.setDiscoveryCountry(country != null && country.length() == 2 ? country.toUpperCase() : null);
        user.setDiscoveryUpdatedAt(Instant.now());
        user = userRepository.save(user);
        DiscoveryLocationDto dto = new DiscoveryLocationDto();
        dto.setZipCode(user.getDiscoveryZipCode());
        dto.setCountry(user.getDiscoveryCountry());
        dto.setUpdatedAt(user.getDiscoveryUpdatedAt());
        return dto;
    }
}

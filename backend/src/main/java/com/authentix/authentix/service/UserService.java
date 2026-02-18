package com.authentix.authentix.service;

import com.authentix.authentix.dto.UpdateProfileRequest;
import com.authentix.authentix.dto.UserDto;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.UserRepository;
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
}

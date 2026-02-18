package com.authentix.authentix.dto;

import com.authentix.authentix.entity.User;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String displayName;
    private String profilePhotoUrl;
    private String bio;
    private String contactInfo;
    private boolean contactVisible;
    private boolean payoutsEnabled;

    public static UserDto fromEntity(User user) {
        return fromEntity(user, true);
    }

    public static UserDto fromEntity(User user, boolean includeContact) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setBio(user.getBio());
        dto.setContactVisible(user.isContactVisible());
        if (includeContact && user.isContactVisible()) {
            dto.setContactInfo(user.getContactInfo());
        }
        dto.setPayoutsEnabled(user.getStripeConnectAccountId() != null && !user.getStripeConnectAccountId().isBlank());
        return dto;
    }
}

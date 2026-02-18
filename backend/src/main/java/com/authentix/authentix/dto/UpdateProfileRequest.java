package com.authentix.authentix.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(max = 100)
    private String displayName;

    @Size(max = 500)
    private String profilePhotoUrl;

    @Size(max = 1000)
    private String bio;

    @Size(max = 200)
    private String contactInfo;

    private Boolean contactVisible;
}

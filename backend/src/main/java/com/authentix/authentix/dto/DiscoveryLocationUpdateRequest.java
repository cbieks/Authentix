package com.authentix.authentix.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiscoveryLocationUpdateRequest {
    @Size(max = 20)
    private String zipCode;

    @Size(min = 2, max = 2)
    private String country;
}

package com.authentix.authentix.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class DiscoveryLocationDto {
    private String zipCode;
    private String country;
    private Instant updatedAt;
}

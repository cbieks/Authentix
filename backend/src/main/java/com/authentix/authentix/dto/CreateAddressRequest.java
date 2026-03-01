package com.authentix.authentix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAddressRequest {
    @NotBlank
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @NotBlank
    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @NotBlank
    @Size(max = 20)
    private String postalCode;

    @NotBlank
    @Size(min = 2, max = 2)
    private String country;

    @Size(max = 50)
    private String phone;

    private boolean isDefault = false;
}

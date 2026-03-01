package com.authentix.authentix.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateAddressRequest {
    @Size(max = 255)
    private String line1;

    @Size(max = 255)
    private String line2;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 20)
    private String postalCode;

    @Size(min = 2, max = 2)
    private String country;

    @Size(max = 50)
    private String phone;

    private Boolean isDefault;
}

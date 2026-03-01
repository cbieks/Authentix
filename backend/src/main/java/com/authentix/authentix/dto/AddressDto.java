package com.authentix.authentix.dto;

import com.authentix.authentix.entity.Address;
import lombok.Data;

import java.time.Instant;

@Data
public class AddressDto {
    private Long id;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private boolean isDefault;
    private Instant createdAt;
    private Instant updatedAt;

    public static AddressDto fromEntity(Address a) {
        AddressDto dto = new AddressDto();
        dto.setId(a.getId());
        dto.setLine1(a.getLine1());
        dto.setLine2(a.getLine2());
        dto.setCity(a.getCity());
        dto.setState(a.getState());
        dto.setPostalCode(a.getPostalCode());
        dto.setCountry(a.getCountry());
        dto.setPhone(a.getPhone());
        dto.setDefault(a.isDefault());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}

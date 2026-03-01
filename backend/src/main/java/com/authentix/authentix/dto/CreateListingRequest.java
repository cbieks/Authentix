package com.authentix.authentix.dto;

import com.authentix.authentix.entity.ShippingOption;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateListingRequest {
    @NotNull
    private Long categoryId;

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 5000)
    private String description;

    @NotNull
    @DecimalMin("0")
    private BigDecimal price;

    @Size(max = 100)
    private String condition;

    private List<String> images = new ArrayList<>();

    @NotNull
    private ShippingOption shippingOption = ShippingOption.SHIP;

    @Size(max = 20)
    private String zipCode;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;
}

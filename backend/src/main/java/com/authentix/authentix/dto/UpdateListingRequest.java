package com.authentix.authentix.dto;

import com.authentix.authentix.entity.ShippingOption;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateListingRequest {
    private Long categoryId;
    @Size(max = 255)
    private String title;
    @Size(max = 5000)
    private String description;
    @DecimalMin("0")
    private BigDecimal price;
    @Size(max = 3)
    private String currency;
    @Size(max = 100)
    private String condition;
    private List<String> images;
    private ShippingOption shippingOption;
}

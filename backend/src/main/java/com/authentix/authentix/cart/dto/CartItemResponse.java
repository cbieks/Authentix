package com.authentix.authentix.cart.dto;
import java.math.BigDecimal;

public record CartItemResponse(
    Long listingId,
    Integer quantity,
    BigDecimal price,
    String title,
    String image,
    String shippingOption
) {}
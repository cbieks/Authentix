package com.authentix.authentix.cart.dto;
import java.math.BigDecimal;

public record CartItemRequest(
    Long listingId,
    Integer quantity,
    BigDecimal price,
    String title,
    String image,
    String shippingOption
) {}
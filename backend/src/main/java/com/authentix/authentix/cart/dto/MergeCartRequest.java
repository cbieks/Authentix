package com.authentix.authentix.cart.dto;
import java.util.List;

public record MergeCartRequest(List<CartItemRequest> items) {}
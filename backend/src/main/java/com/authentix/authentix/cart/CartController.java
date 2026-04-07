package com.authentix.authentix.cart;
import com.authentix.authentix.dto.*;
import com.authentix.authentix.cart.dto.CartItemRequest;
import com.authentix.authentix.cart.dto.CartQuantityRequest;
import com.authentix.authentix.cart.dto.CartResponse;
import com.authentix.authentix.cart.dto.MergeCartRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(@AuthenticationPrincipal(expression = "id") Long userId) {
        return cartService.getCart(userId);
    }

    @PostMapping("/items")
    public CartResponse addItem(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @RequestBody CartItemRequest request
    ) {
        return cartService.addOrUpdateItem(userId, request);
    }

    @PatchMapping("/items/{listingId}")
    public CartResponse updateQuantity(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @PathVariable Long listingId,
        @RequestBody CartQuantityRequest request
    ) {
        return cartService.updateQuantity(userId, listingId, request.quantity());
    }

    @DeleteMapping("/items/{listingId}")
    public CartResponse removeItem(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @PathVariable Long listingId
    ) {
        return cartService.removeItem(userId, listingId);
    }

    @DeleteMapping
    public CartResponse clearCart(@AuthenticationPrincipal(expression = "id") Long userId) {
        return cartService.clearCart(userId);
    }

    @PostMapping("/merge")
    public CartResponse mergeGuestCart(
        @AuthenticationPrincipal(expression = "id") Long userId,
        @RequestBody MergeCartRequest request
    ) {
        return cartService.mergeGuestCart(userId, request.items());
    }
}
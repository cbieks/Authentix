// package com.authentix.authentix.cart;

// import com.authentix.authentix.cart.dto.CartItemRequest;
// import com.authentix.authentix.cart.dto.CartQuantityRequest;
// import com.authentix.authentix.cart.dto.CartResponse;
// import com.authentix.authentix.cart.dto.MergeCartRequest;
// import com.authentix.authentix.security.AuthenticatedUser;
// import org.springframework.security.core.Authentication;
// import lombok.RequiredArgsConstructor;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/cart")
// @RequiredArgsConstructor

// public class CartController {

//     private final CartService cartService;

//     // @GetMapping
//     // public CartResponse getCart(@AuthenticationPrincipal(expression = "id") Long userId) {
//     //     return cartService.getCart(userId);
//     // }
//     @GetMapping
//     public CartResponse getCart(Authentication authentication) {
//         AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
//         return cartService.getCart(auth.getUserId());
//     }

//     // @PostMapping("/items")
//     // public CartResponse addItem(
//     //     @AuthenticationPrincipal(expression = "id") Long userId,
//     //     @RequestBody CartItemRequest request
//     // ) {
//     //     return cartService.addOrUpdateItem(userId, request);
//     // }
//     @PostMapping("/items")
//     public CartResponse addItem(Authentication authentication, @RequestBody CartItemRequest request) {
//         AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
//         Long userId = auth.getId();
//         return cartService.addOrUpdateItem(userId, request);
//     }

//     @PatchMapping("/items/{listingId}")
//     public CartResponse updateQuantity(
//         @AuthenticationPrincipal(expression = "id") Long userId,
//         @PathVariable Long listingId,
//         @RequestBody CartQuantityRequest request
//     ) {
//         return cartService.updateQuantity(userId, listingId, request.quantity());
//     }

//     @DeleteMapping("/items/{listingId}")
//     public CartResponse removeItem(
//         @AuthenticationPrincipal(expression = "id") Long userId,
//         @PathVariable Long listingId
//     ) {
//         return cartService.removeItem(userId, listingId);
//     }

//     @DeleteMapping
//     public CartResponse clearCart(@AuthenticationPrincipal(expression = "id") Long userId) {
//         return cartService.clearCart(userId);
//     }

//     @PostMapping("/merge")
//     public CartResponse mergeGuestCart(
//         @AuthenticationPrincipal(expression = "id") Long userId,
//         @RequestBody MergeCartRequest request
//     ) {
//         return cartService.mergeGuestCart(userId, request.items());
//     }
// }

package com.authentix.authentix.cart;

import com.authentix.authentix.cart.dto.CartItemRequest;
import com.authentix.authentix.cart.dto.CartQuantityRequest;
import com.authentix.authentix.cart.dto.CartResponse;
import com.authentix.authentix.cart.dto.MergeCartRequest;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(Authentication authentication) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.getCart(auth.getUserId());
    }

    @PostMapping("/items")
    public CartResponse addItem(Authentication authentication, @RequestBody CartItemRequest request) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.addOrUpdateItem(auth.getUserId(), request);
    }

    @PatchMapping("/items/{listingId}")
    public CartResponse updateQuantity(
            Authentication authentication,
            @PathVariable Long listingId,
            @RequestBody CartQuantityRequest request
    ) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.updateQuantity(auth.getUserId(), listingId, request.quantity());
    }

    @DeleteMapping("/items/{listingId}")
    public CartResponse removeItem(Authentication authentication, @PathVariable Long listingId) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.removeItem(auth.getUserId(), listingId);
    }

    @DeleteMapping
    public CartResponse clearCart(Authentication authentication) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.clearCart(auth.getUserId());
    }

    @PostMapping("/merge")
    public CartResponse mergeGuestCart(Authentication authentication, @RequestBody MergeCartRequest request) {
        AuthenticatedUser auth = (AuthenticatedUser) authentication.getPrincipal();
        return cartService.mergeGuestCart(auth.getUserId(), request.items());
    }
}
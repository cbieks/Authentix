package com.authentix.authentix.cart;
import com.authentix.authentix.cart.dto.*;
import com.authentix.authentix.cart.dto.CartItemRequest;
import com.authentix.authentix.cart.dto.CartItemResponse;
import com.authentix.authentix.cart.dto.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toResponse(cart);
    }

    public CartResponse addOrUpdateItem(Long userId, CartItemRequest req) {
        Cart cart = getOrCreateCart(userId);
        upsertItem(cart, req);
        return toResponse(cart);
    }

    public CartResponse updateQuantity(Long userId, Long listingId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);

        if (quantity == null || quantity < 1) {
            cartItemRepository.deleteByCartIdAndListingId(cart.getId(), listingId);
            return toResponse(cart);
        }

        CartItem item = cartItemRepository.findByCartIdAndListingId(cart.getId(), listingId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    public CartResponse removeItem(Long userId, Long listingId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartIdAndListingId(cart.getId(), listingId);
        return toResponse(cart);
    }

    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        return new CartResponse(List.of(), 0, BigDecimal.ZERO);
    }

    public CartResponse mergeGuestCart(Long userId, List<CartItemRequest> guestItems) {
        Cart cart = getOrCreateCart(userId);

        if (guestItems != null) {
            for (CartItemRequest req : guestItems) {
                upsertItem(cart, req);
            }
        }

        return toResponse(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            Cart cart = new Cart(userId);
            return cartRepository.save(cart);
        });
    }

    private void upsertItem(Cart cart, CartItemRequest req) {
        if (req == null || req.listingId() == null) {
            return;
        }

        int quantity = req.quantity() == null ? 1 : Math.max(1, req.quantity());

        CartItem item = cartItemRepository.findByCartIdAndListingId(cart.getId(), req.listingId())
            .orElseGet(() -> {
                CartItem created = new CartItem();
                created.setCart(cart);
                created.setListingId(req.listingId());
                created.setQuantity(0);
                return created;
            });

        item.setQuantity(item.getQuantity() + quantity);
        item.setPriceSnapshot(req.price() == null ? BigDecimal.ZERO : req.price());
        item.setTitleSnapshot(req.title());
        item.setImageSnapshot(req.image());
        item.setShippingOptionSnapshot(req.shippingOption());
        cartItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    private CartResponse toResponse(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());

        List<CartItemResponse> mapped = items.stream()
            .map(item -> new CartItemResponse(
                item.getListingId(),
                item.getQuantity(),
                item.getPriceSnapshot(),
                item.getTitleSnapshot(),
                item.getImageSnapshot(),
                item.getShippingOptionSnapshot()
            ))
            .toList();

        int itemCount = mapped.stream().mapToInt(CartItemResponse::quantity).sum();

        BigDecimal subtotal = mapped.stream()
            .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(mapped, itemCount, subtotal);
    }
}
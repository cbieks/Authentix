package com.authentix.authentix.service;

import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.Order;
import com.authentix.authentix.entity.OrderStatus;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;

    @Transactional
    public void markOrderPaidByPaymentIntentId(String stripePaymentIntentId) {
        Order order = orderRepository.findByStripePaymentIntentId(stripePaymentIntentId)
                .orElse(null);
        if (order == null) return;
        if (order.getStatus() == OrderStatus.PAID) return;

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        var listing = order.getListing();
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);
    }
}

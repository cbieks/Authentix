package com.authentix.authentix.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "orders", indexes = {
    @Index(columnList = "buyer_id"),
    @Index(columnList = "listing_id"),
    @Index(columnList = "stripe_payment_intent_id", unique = true),
    @Index(columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(name = "stripe_payment_intent_id", nullable = false, unique = true)
    private String stripePaymentIntentId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "platform_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal platformFee;

    @Column(name = "seller_payout", nullable = false, precision = 19, scale = 2)
    private BigDecimal sellerPayout;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "ship_line1", length = 255)
    private String shipLine1;

    @Column(name = "ship_line2", length = 255)
    private String shipLine2;

    @Column(name = "ship_city", length = 100)
    private String shipCity;

    @Column(name = "ship_state", length = 100)
    private String shipState;

    @Column(name = "ship_postal_code", length = 20)
    private String shipPostalCode;

    @Column(name = "ship_country", length = 2)
    private String shipCountry;

    @Column(name = "ship_phone", length = 50)
    private String shipPhone;

    @PrePersist
    void timestamps() {
        if (createdAt == null) createdAt = Instant.now();
    }
}

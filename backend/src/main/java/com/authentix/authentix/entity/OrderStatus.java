package com.authentix.authentix.entity;

public enum OrderStatus {
    PENDING,   // PaymentIntent created, awaiting payment
    PAID,      // payment_intent.succeeded received
    FAILED,
    REFUNDED
}

package com.authentix.authentix.controller;

import com.authentix.authentix.security.AuthenticatedUser;
import com.authentix.authentix.service.OrderService;
import com.authentix.authentix.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StripeController {

    private final StripeService stripeService;
    private final OrderService orderService;

    @PostMapping("/stripe/connect/onboard")
    public ResponseEntity<?> createConnectOnboardingLink(@AuthenticationPrincipal AuthenticatedUser auth) {
        if (!stripeService.isStripeConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Stripe is not configured"));
        }
        try {
            String url = stripeService.createConnectOnboardingLink(auth.getUserId());
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/orders/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@AuthenticationPrincipal AuthenticatedUser auth,
                                                 @RequestBody Map<String, Long> body) {
        Long listingId = body != null ? body.get("listingId") : null;
        if (listingId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "listingId required"));
        }
        if (!stripeService.isStripeConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "Stripe is not configured"));
        }
        try {
            var result = stripeService.createPaymentIntentForPurchase(listingId, auth.getUserId());
            return ResponseEntity.ok(Map.of(
                    "clientSecret", result.clientSecret(),
                    "orderId", result.orderId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        String webhookSecret = stripeService.getWebhookSecret();
        if (webhookSecret == null || webhookSecret.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Webhook not configured");
        }
        if (sigHeader == null || sigHeader.isBlank()) {
            return ResponseEntity.badRequest().body("Missing Stripe-Signature");
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        }
        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent pi = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
            if (pi != null) {
                orderService.markOrderPaidByPaymentIntentId(pi.getId());
            }
        }
        return ResponseEntity.ok("ok");
    }
}

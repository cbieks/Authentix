package com.authentix.authentix.service;

import com.authentix.authentix.entity.Address;
import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.ListingStatus;
import com.authentix.authentix.entity.Order;
import com.authentix.authentix.entity.OrderStatus;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.OrderRepository;
import com.authentix.authentix.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class StripeService {

    private static final String CURRENCY = "usd";
    private static final int PLATFORM_FEE_PERCENT = 6;

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final AddressService addressService;

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.connect.success-url:http://localhost:5173/account?stripe=success}")
    private String connectSuccessUrl;

    @Value("${stripe.connect.refresh-url:http://localhost:5173/account?stripe=refresh}")
    private String connectRefreshUrl;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    public boolean isStripeConfigured() {
        return secretKey != null && !secretKey.isBlank();
    }

    /**
     * Creates or reuses a Connect Express account for the user and returns an onboarding URL.
     */
    @Transactional
    public String createConnectOnboardingLink(Long userId) throws StripeException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String accountId = user.getStripeConnectAccountId();
        if (accountId == null || accountId.isBlank()) {
            Account account = Account.create(AccountCreateParams.builder()
                    .setType(AccountCreateParams.Type.EXPRESS)
                    .build());
            accountId = account.getId();
            user.setStripeConnectAccountId(accountId);
            userRepository.save(user);
        }

        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setRefreshUrl(connectRefreshUrl)
                .setReturnUrl(connectSuccessUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();
        AccountLink link = AccountLink.create(params);
        return link.getUrl();
    }

    /**
     * Creates a PaymentIntent for buying a listing (destination charge with 6% platform fee)
     * and an Order in PENDING status with shipping address snapshot. Returns client secret for frontend confirmation.
     */
    @Transactional
    public CreatePaymentResult createPaymentIntentForPurchase(Long listingId, Long buyerId, Long addressId) throws StripeException {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new IllegalArgumentException("Listing is not available for purchase");
        }

        User seller = listing.getSeller();
        if (seller.getStripeConnectAccountId() == null || seller.getStripeConnectAccountId().isBlank()) {
            throw new IllegalArgumentException("Seller has not set up payouts");
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
        if (buyer.getId().equals(seller.getId())) {
            throw new IllegalArgumentException("Cannot buy your own listing");
        }

        Address address = addressService.getAddressForUser(addressId, buyerId);

        BigDecimal amount = listing.getPrice();
        long amountCents = amount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();
        long feeCents = (amountCents * PLATFORM_FEE_PERCENT) / 100;
        long transferCents = amountCents - feeCents;

        BigDecimal feeAmount = BigDecimal.valueOf(feeCents, 2);
        BigDecimal payoutAmount = BigDecimal.valueOf(transferCents, 2);

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(CURRENCY)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .setApplicationFeeAmount(feeCents)
                .setTransferData(
                        PaymentIntentCreateParams.TransferData.builder()
                                .setDestination(seller.getStripeConnectAccountId())
                                .build())
                .putMetadata("listingId", listingId.toString())
                .putMetadata("buyerId", buyerId.toString())
                .build();

        var paymentIntent = com.stripe.model.PaymentIntent.create(params);
        String piId = paymentIntent.getId();
        String clientSecret = paymentIntent.getClientSecret();

        Order order = Order.builder()
                .buyer(buyer)
                .listing(listing)
                .stripePaymentIntentId(piId)
                .amount(amount)
                .platformFee(feeAmount)
                .sellerPayout(payoutAmount)
                .status(OrderStatus.PENDING)
                .shipLine1(address.getLine1())
                .shipLine2(address.getLine2())
                .shipCity(address.getCity())
                .shipState(address.getState())
                .shipPostalCode(address.getPostalCode())
                .shipCountry(address.getCountry())
                .shipPhone(address.getPhone())
                .build();
        orderRepository.save(order);

        return new CreatePaymentResult(clientSecret, order.getId());
    }

    /** Returns webhook secret for signature verification; null if not set. */
    public String getWebhookSecret() {
        return (webhookSecret != null && !webhookSecret.isBlank()) ? webhookSecret : null;
    }

    public record CreatePaymentResult(String clientSecret, Long orderId) {}
}

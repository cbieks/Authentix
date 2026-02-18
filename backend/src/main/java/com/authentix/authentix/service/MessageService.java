package com.authentix.authentix.service;

import com.authentix.authentix.dto.MessageDto;
import com.authentix.authentix.entity.Listing;
import com.authentix.authentix.entity.Message;
import com.authentix.authentix.entity.User;
import com.authentix.authentix.repository.ListingRepository;
import com.authentix.authentix.repository.MessageRepository;
import com.authentix.authentix.repository.UserRepository;
import com.authentix.authentix.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        AuthenticatedUser auth = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return auth.getUserId();
    }

    @Transactional
    public MessageDto send(Long listingId, String body) {
        Long senderId = getCurrentUserId();
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        User seller = listing.getSeller();
        if (seller.getId().equals(senderId)) {
            throw new IllegalArgumentException("Cannot message yourself");
        }
        User sender = userRepository.findById(senderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Message msg = Message.builder()
                .listing(listing)
                .sender(sender)
                .receiver(seller)
                .body(body != null && !body.isBlank() ? body.trim() : "")
                .read(false)
                .build();
        messageRepository.save(msg);
        return MessageDto.fromEntity(msg);
    }

    public List<MessageDto> getMyInbox() {
        Long userId = getCurrentUserId();
        return messageRepository.findByReceiverIdOrderByCreatedAtDesc(userId).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markRead(Long messageId) {
        Message msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        if (!msg.getReceiver().getId().equals(getCurrentUserId())) {
            throw new IllegalArgumentException("Not your message");
        }
        msg.setRead(true);
        messageRepository.save(msg);
    }
}

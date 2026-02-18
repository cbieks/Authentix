package com.authentix.authentix.repository;

import com.authentix.authentix.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Message> findByListingIdAndSenderIdOrderByCreatedAtAsc(Long listingId, Long senderId);
    List<Message> findByListingIdAndReceiverIdOrderByCreatedAtAsc(Long listingId, Long receiverId);
}

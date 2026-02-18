package com.authentix.authentix.dto;

import com.authentix.authentix.entity.Message;
import lombok.Data;

import java.time.Instant;

@Data
public class MessageDto {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private Long senderId;
    private String senderDisplayName;
    private Long receiverId;
    private String body;
    private boolean read;
    private Instant createdAt;

    public static MessageDto fromEntity(Message m) {
        MessageDto dto = new MessageDto();
        dto.setId(m.getId());
        dto.setListingId(m.getListing().getId());
        dto.setListingTitle(m.getListing().getTitle());
        dto.setSenderId(m.getSender().getId());
        dto.setSenderDisplayName(m.getSender().getDisplayName());
        dto.setReceiverId(m.getReceiver().getId());
        dto.setBody(m.getBody());
        dto.setRead(m.isRead());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}

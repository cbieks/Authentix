package com.authentix.authentix.controller;

import com.authentix.authentix.dto.MessageDto;
import com.authentix.authentix.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/listings/{id}/message")
    public ResponseEntity<MessageDto> sendMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String messageBody = body != null ? body.get("body") : null;
        return ResponseEntity.ok(messageService.send(id, messageBody));
    }

    @GetMapping("/users/me/inbox")
    public ResponseEntity<List<MessageDto>> getInbox() {
        return ResponseEntity.ok(messageService.getMyInbox());
    }

    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        messageService.markRead(id);
        return ResponseEntity.noContent().build();
    }
}

package com.authentix.authentix.controller;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Bad request"));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException e) {
        String message = e.getMostSpecificCause() != null ? e.getMostSpecificCause().getMessage() : e.getMessage();
        if (message != null) {
            if (message.contains("profile_photo_url") || (message.contains("data too long") && message.contains("users"))) {
                message = "Profile photo is too large for the database. Run in MySQL: ALTER TABLE users MODIFY COLUMN profile_photo_url MEDIUMTEXT;";
            } else if (message.contains("listing_images") || (message.contains("data too long") && message.contains("url"))) {
                message = "Listing image(s) too large for the database. Run in MySQL: ALTER TABLE listing_images MODIFY COLUMN url MEDIUMTEXT;";
            }
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", message != null ? message : "Data constraint violation"));
    }
}

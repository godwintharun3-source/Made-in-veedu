package com.madeinveedu.controller;

import com.madeinveedu.model.ContactRequest;
import com.madeinveedu.repository.ContactRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactRequestRepository contactRequestRepository;

    public ContactController(ContactRequestRepository contactRequestRepository) {
        this.contactRequestRepository = contactRequestRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitContactRequest(@RequestBody ContactRequest request) {
        if (request.getName() == null || request.getEmail() == null || request.getMessage() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, Email, and Message are required."));
        }
        ContactRequest saved = contactRequestRepository.save(request);
        return ResponseEntity.ok(Map.of("message", "Contact request submitted successfully. ID: " + saved.getId()));
    }
}

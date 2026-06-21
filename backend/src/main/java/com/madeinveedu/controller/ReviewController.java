package com.madeinveedu.controller;

import com.madeinveedu.model.Product;
import com.madeinveedu.model.Review;
import com.madeinveedu.model.User;
import com.madeinveedu.repository.ProductRepository;
import com.madeinveedu.repository.ReviewRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewController(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> addReview(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer rating = Integer.valueOf(payload.get("rating").toString());
        String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";

        if (rating < 1 || rating > 5) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Rating must be between 1 and 5"));
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Product not found"));
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(rating)
                .comment(comment)
                .build();

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }
}

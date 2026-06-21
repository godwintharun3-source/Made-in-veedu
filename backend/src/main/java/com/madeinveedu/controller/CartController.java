package com.madeinveedu.controller;

import com.madeinveedu.model.CartItem;
import com.madeinveedu.model.Product;
import com.madeinveedu.model.User;
import com.madeinveedu.repository.CartItemRepository;
import com.madeinveedu.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartController(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(cartItemRepository.findByUser(user));
    }

    @PostMapping
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = Integer.valueOf(payload.get("quantity").toString());

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Product not found"));
        }

        if (product.getAvailableQuantity() < quantity) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Not enough stock available"));
        }

        CartItem cartItem = cartItemRepository.findByUserAndProductId(user, productId).orElse(null);

        if (cartItem == null) {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantity)
                    .subtotal(product.getOfferPrice().multiply(BigDecimal.valueOf(quantity)))
                    .build();
        } else {
            int newQuantity = cartItem.getQuantity() + quantity;
            if (product.getAvailableQuantity() < newQuantity) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Cannot add more. Exceeds available stock."));
            }
            cartItem.setQuantity(newQuantity);
            cartItem.setSubtotal(product.getOfferPrice().multiply(BigDecimal.valueOf(newQuantity)));
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Integer quantity = Integer.valueOf(payload.get("quantity").toString());

        CartItem cartItem = cartItemRepository.findById(id).orElse(null);
        if (cartItem == null || !cartItem.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found"));
        }

        Product product = cartItem.getProduct();
        if (product.getAvailableQuantity() < quantity) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Not enough stock available"));
        }

        cartItem.setQuantity(quantity);
        cartItem.setSubtotal(product.getOfferPrice().multiply(BigDecimal.valueOf(quantity)));

        CartItem updated = cartItemRepository.save(cartItem);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeCartItem(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CartItem cartItem = cartItemRepository.findById(id).orElse(null);
        if (cartItem == null || !cartItem.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Cart item not found"));
        }

        cartItemRepository.delete(cartItem);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping("/clear")
    @Transactional
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        cartItemRepository.deleteByUser(user);
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}

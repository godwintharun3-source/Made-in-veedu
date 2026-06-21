package com.madeinveedu.controller;

import com.madeinveedu.model.*;
import com.madeinveedu.repository.*;
import com.madeinveedu.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final ReviewRepository reviewRepository;
    private final ContactRequestRepository contactRequestRepository;
    private final EmailService emailService;

    public AdminController(UserRepository userRepository, ProductRepository productRepository,
                           OrderRepository orderRepository, CouponRepository couponRepository,
                           ReviewRepository reviewRepository, ContactRequestRepository contactRequestRepository,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.couponRepository = couponRepository;
        this.reviewRepository = reviewRepository;
        this.contactRequestRepository = contactRequestRepository;
        this.emailService = emailService;
    }

    // 1. Manage Users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (user.getRole().equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot disable administrative accounts."));
        }
        user.setActive(!user.getActive());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        if (user.getRole().equals("ADMIN")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete administrative accounts."));
        }
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Customer account deleted successfully."));
    }

    // 2. Manage Products (CRUD)
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        if (product.getAvailableQuantity() == null) {
            product.setAvailableQuantity(product.getTotalQuantity());
        }
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setTotalQuantity(productDetails.getTotalQuantity());
        product.setAvailableQuantity(productDetails.getAvailableQuantity());
        product.setSinglePackPrice(productDetails.getSinglePackPrice());
        product.setOriginalPrice(productDetails.getOriginalPrice());
        product.setOfferPrice(productDetails.getOfferPrice());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        
        Product updated = productRepository.save(product);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        productRepository.delete(product);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    // 3. Manage Orders & Status Flow
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status parameter is required"));
        }

        // Allowed: Shipping, Delivered, Finished, Cancel
        List<String> allowed = Arrays.asList("Ordered", "Shipping", "Delivered", "Finished", "Cancel");
        if (!allowed.contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid order status code"));
        }

        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        try {
            User customer = order.getUser();
            if ("Shipping".equals(newStatus)) {
                emailService.sendOrderShippedEmail(customer.getEmail(), customer.getName(), order.getOrderNumber());
            } else if ("Delivered".equals(newStatus)) {
                emailService.sendOrderDeliveredEmail(customer.getEmail(), customer.getName(), order.getOrderNumber());
            }
        } catch (Exception e) {
            // Ignored, log handled inside emailService
        }

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        orderRepository.delete(order);
        return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
    }

    // 4. Coupons
    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponRepository.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Coupon code already exists."));
        }
        if (coupon.getExpiryDate() == null) {
            coupon.setExpiryDate(LocalDateTime.now().plusDays(30)); // default 30 days
        }
        Coupon saved = couponRepository.save(coupon);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        Coupon coupon = couponRepository.findById(id).orElse(null);
        if (coupon == null) {
            return ResponseEntity.notFound().build();
        }
        couponRepository.delete(coupon);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }

    // 5. Dashboard Analytics
    @GetMapping("/analytics")
    public ResponseEntity<?> getDashboardStats() {
        List<Order> orders = orderRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findAll();

        // Calculate Revenue (all non-cancelled orders)
        BigDecimal totalRevenue = orders.stream()
                .filter(o -> !o.getStatus().equals("Cancel"))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Count non-cancelled orders
        long totalOrders = orders.stream()
                .filter(o -> !o.getStatus().equals("Cancel"))
                .count();

        // Inventory alert list (stock <= 10)
        List<Product> inventoryAlerts = products.stream()
                .filter(p -> p.getAvailableQuantity() <= 10)
                .collect(Collectors.toList());

        // Product performance breakdown
        Map<String, Integer> productSales = products.stream()
                .collect(Collectors.toMap(Product::getName, Product::getSoldQuantity));

        // Group orders by date (for Recharts)
        Map<String, BigDecimal> dailyRevenue = new TreeMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        
        orders.stream()
                .filter(o -> !o.getStatus().equals("Cancel"))
                .forEach(o -> {
                    String date = o.getCreatedAt().format(formatter);
                    dailyRevenue.put(date, dailyRevenue.getOrDefault(date, BigDecimal.ZERO).add(o.getTotalAmount()));
                });

        List<Map<String, Object>> revenueChartData = new ArrayList<>();
        dailyRevenue.forEach((date, rev) -> {
            Map<String, Object> dataItem = new HashMap<>();
            dataItem.put("date", date);
            dataItem.put("revenue", rev);
            revenueChartData.add(dataItem);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("totalSales", totalOrders);
        response.put("totalUsers", users.size() - 1); // exclude admin
        response.put("totalProducts", products.size());
        response.put("inventoryAlertsCount", inventoryAlerts.size());
        response.put("inventoryAlerts", inventoryAlerts);
        response.put("productPerformance", productSales);
        response.put("revenueChartData", revenueChartData);

        return ResponseEntity.ok(response);
    }

    // 6. Contact Requests
    @GetMapping("/contacts")
    public ResponseEntity<List<ContactRequest>> getContactRequests() {
        return ResponseEntity.ok(contactRequestRepository.findAll());
    }

    // 7. Review Management
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewRepository.findAll());
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.delete(review);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }

    // 8. Bulk Email Notifications
    @PostMapping("/bulk-email")
    public ResponseEntity<?> sendBulkEmail(@RequestBody Map<String, String> payload) {
        String subject = payload.get("subject");
        String messageContent = payload.get("message");

        if (subject == null || messageContent == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Subject and message content are required"));
        }

        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole().equals("CUSTOMER") && u.getActive())
                .collect(Collectors.toList());

        // Run async or loop
        new Thread(() -> {
            for (User u : customers) {
                try {
                    emailService.sendBulkEmail(u.getEmail(), subject, messageContent);
                    Thread.sleep(1000); // 1 sec spacing to prevent rate limiting
                } catch (Exception e) {
                    // Ignored, logged inside emailService
                }
            }
        }).start();

        return ResponseEntity.ok(Map.of("message", "Bulk email transmission initiated for " + customers.size() + " customers."));
    }
}

package com.madeinveedu.controller;

import com.madeinveedu.model.*;
import com.madeinveedu.repository.*;
import com.madeinveedu.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final EmailService emailService;

    public OrderController(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                           ProductRepository productRepository, CouponRepository couponRepository,
                           EmailService emailService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> placeOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String paymentMethod = payload.get("paymentMethod").toString();
        String shippingAddress = payload.get("shippingAddress").toString();
        String couponCode = payload.get("couponCode") != null ? payload.get("couponCode").toString() : null;

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Cart is empty"));
        }

        // Calculate initial total
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getAvailableQuantity() < item.getQuantity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Insufficient stock for product: " + product.getName()));
            }
            totalAmount = totalAmount.add(item.getSubtotal());
        }

        // Coupon logic removed as requested.

        // Generate Order Number
        String orderNumber = "MIV-" + System.currentTimeMillis() + "-" + new Random().nextInt(1000);

        // Create Order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .user(user)
                .totalAmount(totalAmount)
                .paymentMethod(paymentMethod)
                .shippingAddress(shippingAddress)
                .status("Ordered")
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            
            // Update product stock
            product.setAvailableQuantity(product.getAvailableQuantity() - item.getQuantity());
            product.setSoldQuantity(product.getSoldQuantity() + item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getOfferPrice())
                    .build();
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUser(user);



        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(orderRepository.findByUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return orderRepository.findById(id)
                .map(order -> {
                    if (order.getUser().getId().equals(user.getId()) || user.getRole().equals("ADMIN")) {
                        return ResponseEntity.ok(order);
                    }
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).<Order>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancelOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null || !order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found"));
        }

        if (!order.getStatus().equals("Ordered")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Order cannot be cancelled in its current state: " + order.getStatus()));
        }

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setAvailableQuantity(product.getAvailableQuantity() + item.getQuantity());
            product.setSoldQuantity(product.getSoldQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("Cancel");
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of("message", "Order cancelled successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null || !order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found"));
        }

        // Only allow deleting orders that are Cancelled or Finished
        if (!order.getStatus().equals("Cancel") && !order.getStatus().equals("Finished")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Only cancelled or completed orders can be deleted from history"));
        }

        orderRepository.delete(order);
        return ResponseEntity.ok(Map.of("message", "Order deleted from history"));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<String> downloadInvoice(@AuthenticationPrincipal User user, @PathVariable Long id) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null || (!order.getUser().getId().equals(user.getId()) && !user.getRole().equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Generate Invoice HTML
        StringBuilder html = new StringBuilder();
        html.append("<html><head><title>Invoice ").append(order.getOrderNumber()).append("</title>")
            .append("<style>")
            .append("body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }")
            .append(".invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); padding: 30px; border-radius: 10px; }")
            .append(".header { display: flex; justify-content: space-between; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 20px; }")
            .append(".logo { font-size: 24px; font-weight: bold; color: #4CAF50; }")
            .append(".details { display: flex; justify-content: space-between; margin-bottom: 30px; }")
            .append("table { width: 100%; border-collapse: collapse; text-align: left; }")
            .append("th, td { padding: 12px; border-bottom: 1px solid #ddd; }")
            .append("th { background-color: #f2f2f2; }")
            .append(".total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }")
            .append("</style></head><body>")
            .append("<div class='invoice-box'>")
            .append("<div class='header'>")
            .append("<div class='logo'>MADE IN VEEDU</div>")
            .append("<div><strong>Invoice #:</strong> ").append(order.getOrderNumber()).append("<br/><strong>Date:</strong> ").append(order.getCreatedAt().toString()).append("</div>")
            .append("</div>")
            .append("<div class='details'>")
            .append("<div><strong>Customer Info:</strong><br/>").append(order.getUser().getName()).append("<br/>").append(order.getUser().getEmail()).append("</div>")
            .append("<div><strong>Shipping Address:</strong><br/>").append(order.getShippingAddress().replaceAll("\n", "<br/>")).append("</div>")
            .append("</div>")
            .append("<table>")
            .append("<thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>")
            .append("<tbody>");

        for (OrderItem item : order.getOrderItems()) {
            BigDecimal sub = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            html.append("<tr>")
                .append("<td>").append(item.getProduct().getName()).append("</td>")
                .append("<td>").append(item.getQuantity()).append("</td>")
                .append("<td>₹").append(item.getPrice().toString()).append("</td>")
                .append("<td>₹").append(sub.toString()).append("</td>")
                .append("</tr>");
        }

        html.append("</tbody></table>")
            .append("<div class='total'>Grand Total: ₹").append(order.getTotalAmount().toString()).append("</div>")
            .append("<div style='text-align: center; margin-top: 50px; font-size: 12px; color: #777;'>Thank you for shopping with Made In Veedu!</div>")
            .append("</div>")
            .append("</body></html>");

        return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .body(html.toString());
    }
}

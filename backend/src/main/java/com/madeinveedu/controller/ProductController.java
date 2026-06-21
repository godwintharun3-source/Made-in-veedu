package com.madeinveedu.controller;

import com.madeinveedu.model.Product;
import com.madeinveedu.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String category) {
        List<Product> products;
        if (category != null && !category.isEmpty()) {
            products = productRepository.findByCategory(category);
        } else {
            products = productRepository.findAll();
        }
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        String lowerQuery = query.toLowerCase();
        List<Product> matches = productRepository.findAll().stream()
                .filter(p -> p.getName().toLowerCase().contains(lowerQuery) 
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(lowerQuery))
                        || (p.getCategory() != null && p.getCategory().toLowerCase().contains(lowerQuery)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(matches);
    }
}

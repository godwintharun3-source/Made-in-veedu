package com.madeinveedu.config;

import com.madeinveedu.model.User;
import com.madeinveedu.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "desienterprises1011@gmail.com";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("Desi Enterprises Admin")
                    .email(adminEmail)
                    .phoneNumber("9443724005")
                    .password(passwordEncoder.encode("madeinveedu2026@appv1"))
                    .role("ADMIN")
                    .state("Tamil Nadu")
                    .district("Chennai")
                    .city("Chennai")
                    .village("Adyar")
                    .addressLine("No. 12, Traditional Street")
                    .pincode("600020")
                    .gender("Male")
                    .active(true)
                    .build();
            
            userRepository.save(admin);
            System.out.println("Default Admin User initialized successfully.");
        }
    }
}

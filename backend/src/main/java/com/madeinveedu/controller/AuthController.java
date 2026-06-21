package com.madeinveedu.controller;

import com.madeinveedu.dto.*;
import com.madeinveedu.model.User;
import com.madeinveedu.repository.UserRepository;
import com.madeinveedu.security.JwtTokenProvider;
import com.madeinveedu.service.EmailService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    // In-memory OTP storage: Email -> OtpDetails
    private final Map<String, OtpDetails> otpStorage = new ConcurrentHashMap<>();

    @Data
    @AllArgsConstructor
    private static class OtpDetails {
        private String code;
        private LocalDateTime expiryTime;
    }

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Email is already taken!"));
        }

        if (userRepository.existsByPhoneNumber(signUpRequest.getPhoneNumber())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Phone number is already taken!"));
        }

        if (!signUpRequest.getPassword().equals(signUpRequest.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Passwords do not match!"));
        }

        // Unique password check
        java.util.List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (passwordEncoder.matches(signUpRequest.getPassword(), u.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "This password has already been chosen by another user. Please select a unique password."));
            }
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .phoneNumber(signUpRequest.getPhoneNumber())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role("CUSTOMER") // Default registered user role is CUSTOMER
                .state(signUpRequest.getState())
                .district(signUpRequest.getDistrict())
                .city(signUpRequest.getCity())
                .village(signUpRequest.getVillage())
                .addressLine(signUpRequest.getAddressLine())
                .pincode(signUpRequest.getPincode())
                .gender(signUpRequest.getGender())
                .altPhoneNumber(signUpRequest.getAltPhoneNumber())
                .altState(signUpRequest.getAltState())
                .altDistrict(signUpRequest.getAltDistrict())
                .altCity(signUpRequest.getAltCity())
                .altVillage(signUpRequest.getAltVillage())
                .altAddressLine(signUpRequest.getAltAddressLine())
                .altPincode(signUpRequest.getAltPincode())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);

        // Send Welcome Email
        try {
            emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getName());
        } catch (Exception e) {
            // Logged inside emailService, do not block registration
        }

        // Generate Tokens
        String accessToken = tokenProvider.generateAccessToken(savedUser.getEmail(), savedUser.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getEmail());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(savedUser))
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody SignInRequest signInRequest) {
        User user = userRepository.findByEmail(signInRequest.getEmail()).orElse(null);

        if (user == null || !user.getActive() || !passwordEncoder.matches(signInRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password!"));
        }

        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (refreshToken != null && tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getEmailFromToken(refreshToken);
            User user = userRepository.findByEmail(email).orElse(null);

            if (user != null && user.getActive()) {
                String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole());
                String newRefreshToken = tokenProvider.generateRefreshToken(user.getEmail());

                AuthResponse authResponse = AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .user(mapToUserResponse(user))
                        .build();

                return ResponseEntity.ok(authResponse);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid refresh token!"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            // Return OK to prevent email harvesting, or BAD_REQUEST for simple feedback. Let's return BAD_REQUEST to make it user-friendly.
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User with this email does not exist."));
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5); // 5 min expiry
        otpStorage.put(user.getEmail(), new OtpDetails(otp, expiry));

        // Send OTP Email
        emailService.sendOtpEmail(user.getEmail(), otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to your email."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetRequest request) {
        OtpDetails details = otpStorage.get(request.getEmail());

        if (details == null || !details.getCode().equals(request.getOtp())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid OTP."));
        }

        if (details.getExpiryTime().isBefore(LocalDateTime.now())) {
            otpStorage.remove(request.getEmail());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "OTP has expired."));
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Passwords do not match."));
        }

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User not found."));
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        otpStorage.remove(request.getEmail()); // Clean up

        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now login."));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid input parameters. Password must be min 8 characters."));
        }
        
        if (!newPassword.matches("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character."));
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Incorrect current password."));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .state(user.getState())
                .district(user.getDistrict())
                .city(user.getCity())
                .village(user.getVillage())
                .addressLine(user.getAddressLine())
                .pincode(user.getPincode())
                .gender(user.getGender())
                .altPhoneNumber(user.getAltPhoneNumber())
                .altState(user.getAltState())
                .altDistrict(user.getAltDistrict())
                .altCity(user.getAltCity())
                .altVillage(user.getAltVillage())
                .altAddressLine(user.getAltAddressLine())
                .altPincode(user.getAltPincode())
                .build();
    }
}

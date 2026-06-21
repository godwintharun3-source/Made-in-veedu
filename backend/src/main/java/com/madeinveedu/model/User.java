package com.madeinveedu.model;

import com.madeinveedu.config.EncryptionConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false)
    @Convert(converter = EncryptionConverter.class)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Convert(converter = EncryptionConverter.class)
    private String state;

    @Convert(converter = EncryptionConverter.class)
    private String district;

    @Convert(converter = EncryptionConverter.class)
    private String city;

    @Convert(converter = EncryptionConverter.class)
    private String village;

    @Column(name = "address_line")
    @Convert(converter = EncryptionConverter.class)
    private String addressLine;

    @Convert(converter = EncryptionConverter.class)
    private String pincode;

    @Column(length = 50)
    private String gender;

    @Column(nullable = false)
    private String role; // "ADMIN" or "CUSTOMER"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // Alternative Contact & Address fields
    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_phone_number")
    private String altPhoneNumber;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_state")
    private String altState;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_district")
    private String altDistrict;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_city")
    private String altCity;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_village")
    private String altVillage;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_address_line")
    private String altAddressLine;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "alt_pincode")
    private String altPincode;
}

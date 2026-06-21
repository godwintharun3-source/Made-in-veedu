package com.madeinveedu.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignUpRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Pattern(regexp = "^[A-Za-z\\s]+$", message = "Name must contain only alphabets and spaces")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be valid")
    private String phoneNumber;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_]).{8,}$", message = "Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    private String state;
    private String district;
    private String city;
    private String village;
    private String addressLine;
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be 6 digits")
    private String pincode;
    
    private String gender;

    // Alternate details
    @Pattern(regexp = "^(\\+?[0-9]{10,15})?$", message = "Alternate phone number must be valid if provided")
    private String altPhoneNumber;
    private String altState;
    private String altDistrict;
    private String altCity;
    private String altVillage;
    private String altAddressLine;
    @Pattern(regexp = "^([1-9][0-9]{5})?$", message = "Alternate pincode must be 6 digits if provided")
    private String altPincode;
}

package com.madeinveedu.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
    private String state;
    private String district;
    private String city;
    private String village;
    private String addressLine;
    private String pincode;
    private String gender;

    private String altPhoneNumber;
    private String altState;
    private String altDistrict;
    private String altCity;
    private String altVillage;
    private String altAddressLine;
    private String altPincode;
}

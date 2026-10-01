package com.loginapp.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest (
    
    @NotBlank(message="Email is required")
    String email,

    @NotBlank(message = "Password is Requiered")
    String password

){
}

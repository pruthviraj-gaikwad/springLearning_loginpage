package com.loginapp.backend.dto;

public record LoginResponse (
    String accessToken,
    String tokenType,
    UserResponse user
){
}

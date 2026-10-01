package com.loginapp.backend.service;

import java.nio.charset.StandardCharsets;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.loginapp.backend.dto.LoginRequest;
import com.loginapp.backend.dto.LoginResponse;
import com.loginapp.backend.dto.RegisterRequest;
import com.loginapp.backend.dto.UserResponse;
import com.loginapp.backend.entity.User;
import com.loginapp.backend.exception.EmailAlreadyExistsException;
import com.loginapp.backend.exception.InvalidCredentialsException;
import com.loginapp.backend.exception.InvalidPasswordException;
import com.loginapp.backend.repository.UserRepository;
import com.loginapp.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    // BCrypt only accepts passwords up to 72 BYTES. @Size counts characters, and
    // characters such as "€" or emoji use 2-4 bytes each, so we check the bytes here.
    private static final int BCRYPT_MAX_PASSWORD_BYTES = 72;

    public UserResponse register(RegisterRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_PASSWORD_BYTES) {
            throw new InvalidPasswordException(
                    "Password is too long (maximum 72 bytes; some characters count as more than one)");
        }

        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(email);
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        return toResponse(userRepository.save(user));
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, "Bearer", toResponse(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}

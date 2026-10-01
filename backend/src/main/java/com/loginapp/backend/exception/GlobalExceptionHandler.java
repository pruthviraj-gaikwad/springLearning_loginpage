package com.loginapp.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- Our own exceptions -------------------------------------------------

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailExists(EmailAlreadyExistsException ex) {
        return build(HttpStatus.CONFLICT, "This email is already registered", Map.of("email", "Email is already registered"));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), Map.of());
    }

    @ExceptionHandler(InvalidPasswordException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPassword(InvalidPasswordException ex) {
        return build(HttpStatus.BAD_REQUEST, "Validation failed", Map.of("password", ex.getMessage()));
    }

    // ---- Spring Security exceptions that reach a controller -----------------

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to do this", Map.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex) {
        return build(HttpStatus.UNAUTHORIZED, "Authentication is required", Map.of());
    }

    // ---- Database: two requests registering the same email at the same time --

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return build(HttpStatus.CONFLICT, "The request conflicts with existing data", Map.of());
    }

    // ---- Last resort: anything unexpected -> 500, details only in the log ----

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, messageFor(HttpStatus.INTERNAL_SERVER_ERROR), Map.of());
    }

    // ---- Standard Spring MVC errors (404, 405, 415, malformed JSON, ...) ------
    // The parent class already catches these; we only change the response body.

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(status).body(new ErrorResponse(status.value(), "Validation failed", fieldErrors));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body,
            HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {

        return ResponseEntity.status(statusCode).headers(headers)
                .body(new ErrorResponse(statusCode.value(), messageFor(statusCode), Map.of()));
    }

    // ---- Helpers ------------------------------------------------------------

    private String messageFor(HttpStatusCode status) {
        return switch (status.value()) {
            case 400 -> "The request is invalid";
            case 404 -> "The requested resource was not found";
            case 405 -> "This HTTP method is not allowed for this resource";
            case 415 -> "Unsupported content type";
            default -> status.is5xxServerError()
                    ? "Something went wrong on our side. Please try again later."
                    : "The request could not be processed";
        };
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, Map<String, String> fieldErrors) {
        return ResponseEntity.status(status).body(new ErrorResponse(status.value(), message, fieldErrors));
    }
}

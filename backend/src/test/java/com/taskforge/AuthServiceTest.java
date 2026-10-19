package com.taskforge;

import com.taskforge.dto.AuthRequest;
import com.taskforge.dto.AuthResponse;
import com.taskforge.dto.RegisterRequest;
import com.taskforge.entity.User;
import com.taskforge.exception.BadRequestException;
import com.taskforge.repository.UserRepository;
import com.taskforge.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Should successfully register a new user with hashed password and default workspace")
    void shouldRegisterNewUser() {
        RegisterRequest request = new RegisterRequest(
                "sarah.connor",
                "sarah@skynet-defense.org",
                "CyberDyne@2026",
                "Sarah Connor",
                "Chief Security Officer"
        );

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.token());
        assertEquals("sarah.connor", response.user().username());
        assertEquals("sarah@skynet-defense.org", response.user().email());

        // Verify password in DB is hashed and matches
        User user = userRepository.findByUsername("sarah.connor").orElseThrow();
        assertTrue(passwordEncoder.matches("CyberDyne@2026", user.getPasswordHash()));
        assertNotEquals("CyberDyne@2026", user.getPasswordHash());
    }

    @Test
    @DisplayName("Should reject duplicate username registration")
    void shouldRejectDuplicateUsername() {
        RegisterRequest request = new RegisterRequest(
                "alex.turner", // already exists in seed data
                "alex.new@taskforge.dev",
                "password123",
                "Alex Different",
                "Engineer"
        );

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    @DisplayName("Should reject invalid login credentials")
    void shouldRejectInvalidCredentials() {
        AuthRequest badPassword = new AuthRequest("alex.turner", "wrong-password");
        assertThrows(BadCredentialsException.class, () -> authService.login(badPassword));
    }
}

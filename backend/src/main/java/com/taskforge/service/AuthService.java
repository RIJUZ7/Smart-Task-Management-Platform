package com.taskforge.service;

import com.taskforge.dto.AuthRequest;
import com.taskforge.dto.AuthResponse;
import com.taskforge.dto.RegisterRequest;
import com.taskforge.dto.UserDto;
import com.taskforge.entity.User;
import com.taskforge.entity.Workspace;
import com.taskforge.entity.WorkspaceMembership;
import com.taskforge.entity.WorkspaceRole;
import com.taskforge.exception.BadRequestException;
import com.taskforge.repository.UserRepository;
import com.taskforge.repository.WorkspaceMembershipRepository;
import com.taskforge.repository.WorkspaceRepository;
import com.taskforge.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMembershipRepository membershipRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        return new AuthResponse(jwt, UserService.toDto(user));
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email address is already registered");
        }

        User user = new User();
        user.setUsername(request.username().toLowerCase(Locale.ROOT).trim());
        user.setEmail(request.email().toLowerCase(Locale.ROOT).trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setJobTitle(request.jobTitle() != null ? request.jobTitle().trim() : "Member");
        user.setAvatarColor("#F26B38");

        User savedUser = userRepository.save(user);

        // Auto-provision personal workspace for seamless onboarding
        String workspaceSlug = generateUniqueSlug(user.getUsername() + "-ops");
        Workspace workspace = new Workspace();
        workspace.setName(user.getFullName() + "'s Operations");
        workspace.setSlug(workspaceSlug);
        workspace.setDescription("Default operations workspace for " + user.getFullName());
        workspace.setCreatedBy(savedUser);
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        WorkspaceMembership membership = new WorkspaceMembership(savedWorkspace, savedUser, WorkspaceRole.ADMIN);
        membershipRepository.save(membership);

        String jwt = tokenProvider.generateTokenFromUsername(savedUser.getUsername());
        return new AuthResponse(jwt, UserService.toDto(savedUser));
    }

    private String generateUniqueSlug(String base) {
        String slug = base.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9-]", "-");
        if (!workspaceRepository.existsBySlug(slug)) {
            return slug;
        }
        int counter = 1;
        while (workspaceRepository.existsBySlug(slug + "-" + counter)) {
            counter++;
        }
        return slug + "-" + counter;
    }
}

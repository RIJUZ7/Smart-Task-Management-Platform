package com.taskforge.service;

import com.taskforge.dto.PasswordChangeRequest;
import com.taskforge.dto.UpdateProfileRequest;
import com.taskforge.dto.UserDto;
import com.taskforge.entity.User;
import com.taskforge.exception.BadRequestException;
import com.taskforge.exception.ResourceNotFoundException;
import com.taskforge.repository.UserRepository;
import com.taskforge.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUserDto() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.fullName());
        if (request.jobTitle() != null) {
            user.setJobTitle(request.jobTitle());
        }
        if (request.avatarColor() != null && !request.avatarColor().isBlank()) {
            user.setAvatarColor(request.avatarColor());
        }

        User updated = userRepository.save(user);
        return toDto(updated);
    }

    @Transactional
    public void changePassword(PasswordChangeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public static UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getJobTitle(),
                user.getAvatarColor(),
                user.getCreatedAt()
        );
    }
}

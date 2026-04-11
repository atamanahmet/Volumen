package com.atamanahmet.volumen.service;

import com.atamanahmet.volumen.domain.User;
import com.atamanahmet.volumen.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findUser_shouldReturnUser_whenExists() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setUsername("testUser");
        when(userRepository.findById(id)).thenReturn(Optional.of(user));

        Optional<User> result = userService.findUser(id);

        assertTrue(result.isPresent());
        assertEquals("testUser", result.get().getUsername());
    }

    @Test
    void findUser_shouldReturnEmpty_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        Optional<User> result = userService.findUser(id);

        assertTrue(result.isEmpty());
    }

    @Test
    void saveUser_shouldCallRepository() {
        User user = new User();
        user.setUsername("testUser");
        userService.saveUser(user);
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void saveUser_shouldCallRepositoryAndReturnUser() {
        User user = new User();
        user.setUsername("testUser");
        when(userRepository.save(user)).thenReturn(user);

        User result = userService.saveUser(user);

        verify(userRepository, times(1)).save(user);
        assertEquals(user, result);
    }
}
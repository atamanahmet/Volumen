package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.domain.POJO.Book;
import com.atamanahmet.volumen.domain.POJO.User;
import com.atamanahmet.volumen.service.BookSearchService;
import com.atamanahmet.volumen.service.BookService;
import com.atamanahmet.volumen.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookControllerTest {

    @Mock
    private BookService bookService;
    @Mock
    private UserService userService;
    @Mock
    private BookSearchService bookSearchService;

    @InjectMocks
    private BookController bookController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getList_shouldReturnBooks_whenUserExists() {
        UUID userId = UUID.randomUUID();
        UUID bookId = UUID.randomUUID();
        User user = new User();
        user.setBookIds(List.of(bookId));

        Book book = new Book();
        book.setTitle("Dune");

        when(userService.findUser(userId)).thenReturn(Optional.of(user));
        when(bookService.findByIdList(List.of(bookId))).thenReturn(List.of(book));

        ResponseEntity<List<Book>> response = bookController.getList(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Dune", response.getBody().get(0).getTitle());
    }

    @Test
    void getList_shouldReturnEmpty_whenUserNotExists() {
        UUID userId = UUID.randomUUID();
        when(userService.findUser(userId)).thenReturn(Optional.empty());
        when(bookService.findByIdList(new ArrayList<>())).thenReturn(new ArrayList<>());

        ResponseEntity<List<Book>> response = bookController.getList(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void saveBook_shouldReturn400_whenBookIdIsNull() {
        UUID userId = UUID.randomUUID();
        Book book = new Book();

        ResponseEntity<String> response = bookController.saveBook(userId, book);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveBook_shouldReturn404_whenBookNotFound() {
        UUID userId = UUID.randomUUID();
        Book book = new Book();
        book.setId(UUID.randomUUID());

        when(bookService.findById(book.getId())).thenReturn(Optional.empty());

        ResponseEntity<String> response = bookController.saveBook(userId, book);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void saveBook_shouldReturn404_whenUserNotFound() {
        UUID userId = UUID.randomUUID();
        Book book = new Book();
        book.setId(UUID.randomUUID());

        when(bookService.findById(book.getId())).thenReturn(Optional.of(book));
        when(userService.findUser(userId)).thenReturn(Optional.empty());

        ResponseEntity<String> response = bookController.saveBook(userId, book);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void saveBook_shouldReturn200_whenSuccessful() {
        UUID userId = UUID.randomUUID();
        Book book = new Book();
        book.setId(UUID.randomUUID());

        User user = new User();
        user.setBookIds(new ArrayList<>());

        when(bookService.findById(book.getId())).thenReturn(Optional.of(book));
        when(userService.findUser(userId)).thenReturn(Optional.of(user));

        ResponseEntity<String> response = bookController.saveBook(userId, book);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService, times(1)).saveUser(user);
    }
}
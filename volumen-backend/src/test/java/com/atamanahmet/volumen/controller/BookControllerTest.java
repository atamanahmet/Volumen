package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.domain.Book;
import com.atamanahmet.volumen.domain.DTO.BookDTO;
import com.atamanahmet.volumen.domain.User;
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

    @Mock private BookService bookService;
    @Mock private UserService userService;
    @Mock private BookSearchService bookSearchService;

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
    void getList_shouldReturnEmpty_whenUserNotFound() {
        UUID userId = UUID.randomUUID();
        when(userService.findUser(userId)).thenReturn(Optional.empty());
        when(bookService.findByIdList(new ArrayList<>())).thenReturn(new ArrayList<>());

        ResponseEntity<List<Book>> response = bookController.getList(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
    }

    // --- saveBook ---

    @Test
    void saveBook_shouldReturn400_whenKeyIsNull() {
        UUID userId = UUID.randomUUID();
        BookDTO dto = new BookDTO(); // key and title are null

        ResponseEntity<String> response = bookController.saveBook(userId, dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveBook_shouldReturn400_whenTitleIsNull() {
        UUID userId = UUID.randomUUID();
        BookDTO dto = new BookDTO();
        dto.setKey("/works/OL123");
        // title is null

        ResponseEntity<String> response = bookController.saveBook(userId, dto);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

//    @Test
//    void saveBook_shouldReturn404_whenUserNotFound() {
//        UUID userId = UUID.randomUUID();
//        BookDTO dto = new BookDTO();
//        dto.setKey("/works/OL123");
//        dto.setTitle("Dune");
//
//        when(userService.findUser(userId)).thenReturn(Optional.empty());
//
//        ResponseEntity<String> response = bookController.saveBook(userId, dto);
//
//        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
//    }

    @Test
    void saveBook_shouldSaveNewBook_whenNotInDb() {
        UUID userId = UUID.randomUUID();
        BookDTO dto = new BookDTO();
        dto.setKey("/works/OL123");
        dto.setTitle("Dune");

        User user = new User();
        user.setBookIds(new ArrayList<>());

        Book savedBook = new Book();
        savedBook.setId(UUID.randomUUID());

        when(userService.findUser(userId)).thenReturn(Optional.of(user));
        when(bookService.findByKey("/works/OL123")).thenReturn(Optional.empty());
        when(bookService.save(any(Book.class))).thenReturn(savedBook);

        ResponseEntity<String> response = bookController.saveBook(userId, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(bookService, times(1)).save(any(Book.class));
        verify(userService, times(1)).saveUser(user);
        assertTrue(user.getBookIds().contains(savedBook.getId()));
    }

    @Test
    void saveBook_shouldReuseExistingBook_whenAlreadyInDb() {
        UUID userId = UUID.randomUUID();
        BookDTO dto = new BookDTO();
        dto.setKey("/works/OL123");
        dto.setTitle("Dune");

        User user = new User();
        user.setBookIds(new ArrayList<>());

        Book existingBook = new Book();
        existingBook.setId(UUID.randomUUID());

        when(userService.findUser(userId)).thenReturn(Optional.of(user));
        when(userService.saveUser(any(User.class))).thenReturn(user);
        when(bookService.findByKey("/works/OL123")).thenReturn(Optional.of(existingBook));

        ResponseEntity<String> response = bookController.saveBook(userId, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(bookService, never()).save(any(Book.class));
        verify(userService, times(1)).saveUser(user);
        assertTrue(user.getBookIds().contains(existingBook.getId()));
    }

    @Test
    void saveBook_shouldNotAddDuplicate_whenBookAlreadyInUserList() {
        UUID userId = UUID.randomUUID();
        BookDTO dto = new BookDTO();
        dto.setKey("/works/OL123");
        dto.setTitle("Dune");

        Book existingBook = new Book();
        UUID bookId = UUID.randomUUID();
        existingBook.setId(bookId);

        User user = new User();
        user.setBookIds(new ArrayList<>(List.of(bookId))); // already has the book

        when(userService.findUser(userId)).thenReturn(Optional.of(user));
        when(bookService.findByKey("/works/OL123")).thenReturn(Optional.of(existingBook));

        ResponseEntity<String> response = bookController.saveBook(userId, dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(userService, never()).saveUser(any()); // no update needed
        assertEquals(1, user.getBookIds().size()); // still only one entry
    }
}
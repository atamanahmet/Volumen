package com.atamanahmet.volumen.service;

import com.atamanahmet.volumen.domain.Book;
import com.atamanahmet.volumen.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookService bookService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void saveBook_shouldCallRepository() {
        Book book = new Book();
        book.setTitle("Dune");
        bookService.saveBook(book);
        verify(bookRepository, times(1)).save(book);
    }

    @Test
    void findById_shouldReturnBook_whenExists() {
        UUID id = UUID.randomUUID();
        Book book = new Book();
        book.setTitle("1984");
        when(bookRepository.findById(id)).thenReturn(Optional.of(book));

        Optional<Book> result = bookService.findById(id);

        assertTrue(result.isPresent());
        assertEquals("1984", result.get().getTitle());
    }

    @Test
    void findById_shouldReturnEmpty_whenNotExists() {
        UUID id = UUID.randomUUID();
        when(bookRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Book> result = bookService.findById(id);

        assertTrue(result.isEmpty());
    }

    @Test
    void findByIdList_shouldReturnBooks() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        Book book1 = new Book();
        Book book2 = new Book();
        book1.setTitle("Book 1");
        book2.setTitle("Book 2");

        when(bookRepository.findAllById(List.of(id1, id2))).thenReturn(List.of(book1, book2));

        List<Book> result = bookService.findByIdList(List.of(id1, id2));

        assertEquals(2, result.size());
    }

    @Test
    void deleteBook_shouldCallRepository() {
        Book book = new Book();
        bookService.deleteBook(book);
        verify(bookRepository, times(1)).delete(book);
    }
}
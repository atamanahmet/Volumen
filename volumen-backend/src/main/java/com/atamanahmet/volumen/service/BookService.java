package com.atamanahmet.volumen.service;

import com.atamanahmet.volumen.domain.POJO.Book;
import com.atamanahmet.volumen.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookService {

    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public void saveBook(Book book) {
        bookRepository.save(book);
    }

    public void deleteBook(Book book) {
        bookRepository.delete(book);
    }

    public Optional<Book> findById(UUID id) {
        return bookRepository.findById(id);
    }

    public List<Book> findByIdList(List<UUID> idList) {
        return bookRepository.findAllById(idList);
    }
}
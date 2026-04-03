package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.domain.POJO.Book;
import com.atamanahmet.volumen.domain.POJO.User;
import com.atamanahmet.volumen.service.BookSearchService;
import com.atamanahmet.volumen.service.BookService;
import com.atamanahmet.volumen.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;
    private final UserService userService;
    private final BookSearchService bookSearchService;

    public BookController(BookService bookService, UserService userService, BookSearchService bookSearchService) {
        this.bookService = bookService;
        this.userService = userService;
        this.bookSearchService = bookSearchService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<Book>> getList(@RequestParam UUID userId) {
        List<UUID> bookIds = userService.findUser(userId)
                .map(User::getBookIds)
                .orElse(new ArrayList<>());
        return ResponseEntity.ok(bookService.findByIdList(bookIds));
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveBook(@RequestParam UUID userId, @RequestBody Book book) {
        if (book.getId() == null) {
            return ResponseEntity.badRequest().body("Book ID is required");
        }

        Optional<Book> optionalBook = bookService.findById(book.getId());
        if (optionalBook.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book not found");
        }

        Optional<User> optionalUser = userService.findUser(userId);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = optionalUser.get();

        if (user.getBookIds() == null) {
            user.setBookIds(new ArrayList<>());
        }

        user.getBookIds().add(optionalBook.get().getId());
        user.getBookIds().add(optionalBook.get().getId());
        userService.saveUser(user);

        return ResponseEntity.ok("Book saved to user");
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<List<Book>> findByIsbn(@PathVariable String isbn)
            throws URISyntaxException, IOException, InterruptedException {
        if (isbn == null || isbn.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookSearchService.searchByIsbn(isbn));
    }
}
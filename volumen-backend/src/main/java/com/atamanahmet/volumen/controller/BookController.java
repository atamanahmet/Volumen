package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.domain.Book;
import com.atamanahmet.volumen.domain.DTO.BookDTO;
import com.atamanahmet.volumen.domain.User;
import com.atamanahmet.volumen.service.BookSearchService;
import com.atamanahmet.volumen.service.BookService;
import com.atamanahmet.volumen.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final UserService userService;
    private final BookSearchService bookSearchService;

    @GetMapping("/list")
    public ResponseEntity<List<Book>> getList(@RequestParam UUID userId) {
        List<UUID> bookIds = userService.findUser(userId)
                .map(User::getBookIds)
                .orElse(new ArrayList<>());
        return ResponseEntity.ok(bookService.findByIdList(bookIds));
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveBook(@RequestParam UUID userId, @RequestBody BookDTO bookDTO) {
        if (bookDTO.getKey() == null || bookDTO.getTitle() == null) {
            return ResponseEntity.badRequest().body("Book key and title are required");
        }

        User user = userService.findUser(userId).orElseGet(() -> {
            User newUser = new User();
            newUser.setId(userId);
            return userService.saveUser(newUser);
        });

        Book savedBook = bookService.findByKey(bookDTO.getKey())
                .orElseGet(() -> {
                    Book newBook = new Book();
                    newBook.setKey(bookDTO.getKey());
                    newBook.setTitle(bookDTO.getTitle());
                    newBook.setAuthor_name(bookDTO.getAuthor_name());
                    newBook.setAuthor_key(bookDTO.getAuthor_key());
                    newBook.setCover_i(bookDTO.getCover_i());
                    newBook.setFirst_publish_year(bookDTO.getFirst_publish_year());
                    newBook.setLanguage(bookDTO.getLanguage());
                    newBook.setEbook_access(bookDTO.getEbook_access());
                    newBook.setHas_fulltext(bookDTO.isHas_fulltext());
                    newBook.setPublic_scan_b(bookDTO.isPublic_scan_b());
                    return bookService.save(newBook);
                });

        if (user.getBookIds() == null) user.setBookIds(new ArrayList<>());

        if (!user.getBookIds().contains(savedBook.getId())) {
            user.getBookIds().add(savedBook.getId());
            userService.saveUser(user);
        }

        return ResponseEntity.ok("Book saved to user");
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<List<BookDTO>> findByIsbn(@PathVariable String isbn)
            throws URISyntaxException, IOException, InterruptedException {
        if (isbn == null || isbn.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(bookSearchService.searchByIsbn(isbn));
    }
}
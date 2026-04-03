package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.service.BookSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URISyntaxException;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/search")
public class SearchController {

    private final BookSearchService bookSearchService;

    public SearchController(BookSearchService bookSearchService) {
        this.bookSearchService = bookSearchService;
    }

    @GetMapping("/{text}")
    public ResponseEntity<String> searchByText(@PathVariable String text)
            throws URISyntaxException, IOException, InterruptedException {
        return ResponseEntity.ok(bookSearchService.searchByText(text));
    }
}
package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.domain.Book;
import com.atamanahmet.volumen.domain.DTO.BookDTO;
import com.atamanahmet.volumen.service.BookSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final BookSearchService bookSearchService;

    @GetMapping("/{text}")
    public ResponseEntity<List<BookDTO>> searchByText(@PathVariable String text)
            throws URISyntaxException, IOException, InterruptedException {
        return ResponseEntity.ok(bookSearchService.searchByText(text));
    }
}
package com.atamanahmet.volumen.service;

import com.atamanahmet.volumen.domain.DTO.BookDTO;
import com.atamanahmet.volumen.domain.DTO.OpenLibResponse;
import com.atamanahmet.volumen.domain.Book;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class BookSearchService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public BookSearchService() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    public List<BookDTO> searchByText(String text) throws URISyntaxException, IOException, InterruptedException {
        text = text.trim().replaceAll("\\s+", "+");
        if (text.isEmpty()) {
            return Collections.emptyList();
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://openlibrary.org/search.json?q=" + text + "&limit=10"))
                .header("User-Agent", "Volumen/1.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        OpenLibResponse libResponse = objectMapper.readValue(response.body(), OpenLibResponse.class);

        return libResponse.getDocs();
    }

    public List<BookDTO> searchByIsbn(String isbn) throws URISyntaxException, IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://openlibrary.org/search.json?isbn=" + isbn + "&limit=10"))
                .header("User-Agent", "Volumen/1.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        OpenLibResponse libResponse = objectMapper.readValue(response.body(), OpenLibResponse.class);

        return libResponse.getDocs();
    }

    private Book fetchBookDetails(String olidKey) throws URISyntaxException, IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI("https://openlibrary.org/books/" + olidKey + ".json"))
                .header("User-Agent", "Volumen/1.0")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode details = objectMapper.readTree(response.body());

        Book book = new Book();

        if (details.has("title"))
            book.setTitle(details.get("title").asText());
        if (details.has("authors"))
            book.setAuthor_name(fetchAuthorNames(details.get("authors")));
        if (details.has("covers") && details.get("covers").isArray()) {
            book.setCover_i(details.get("covers").get(0).asText());
        }
        if (details.has("key"))
            book.setKey(details.get("key").asText());
        if (details.has("publish_date")) {
            try {
                book.setFirst_publish_year(
                        Integer.parseInt(details.get("publish_date").asText().replaceAll(".*?(\\d{4}).*", "$1")));
            } catch (Exception ignored) {
            }
        }
        if (details.has("languages")) {
            List<String> langs = new ArrayList<>();
            for (JsonNode lang : details.get("languages")) {
                if (lang.has("key"))
                    langs.add(lang.get("key").asText());
            }
            book.setLanguage(langs);
        }

        return book;
    }

    private List<String> fetchAuthorNames(JsonNode authorsNode)
            throws URISyntaxException, IOException, InterruptedException {
        List<String> names = new ArrayList<>();
        for (JsonNode author : authorsNode) {
            if (author.has("key")) {
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(new URI("https://openlibrary.org" + author.get("key").asText() + ".json"))
                        .header("User-Agent", "Volumen/1.0")
                        .GET()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                JsonNode authorJson = objectMapper.readTree(response.body());
                if (authorJson.has("name"))
                    names.add(authorJson.get("name").asText());
            }
        }
        return names;
    }
}
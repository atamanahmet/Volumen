package com.atamanahmet.volumen.domain.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookDTO {
    private List<String> author_key;
    private List<String> author_name;
    private String ebook_access;
    private int edition_count;
    private int first_publish_year;
    private boolean has_fulltext;
    private String key;
    private List<String> language;
    private boolean public_scan_b;
    private String title;
    private String cover_i;
}
package com.atamanahmet.volumen.domain.DTO;

import java.util.List;

import com.atamanahmet.volumen.domain.Book;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenLibResponse {
    private List<BookDTO> docs;
}

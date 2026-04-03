package com.atamanahmet.volumen.config;

import net.sourceforge.tess4j.Tesseract;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OcrConfig {

    @Bean
    public Tesseract tesseract() {
        Tesseract tesseract = new Tesseract();
        // tesseract.setDatapath("C:/Program Files/Tesseract-OCR/tessdata");
        return tesseract;
    }
}
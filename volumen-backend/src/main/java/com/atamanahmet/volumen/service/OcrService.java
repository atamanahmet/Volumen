package com.atamanahmet.volumen.service;

import java.awt.image.BufferedImage;

public interface OcrService {
    String extractText(String imagePath);
    String extractText(BufferedImage image);
}
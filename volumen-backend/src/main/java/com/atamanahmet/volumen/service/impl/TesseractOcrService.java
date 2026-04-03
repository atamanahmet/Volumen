package com.atamanahmet.volumen.service.impl;

import com.atamanahmet.volumen.service.OcrService;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.File;

@Service
public class TesseractOcrService implements OcrService {

    private final Tesseract tesseract;

    public TesseractOcrService(Tesseract tesseract) {
        this.tesseract = tesseract;
    }

    @Override
    public String extractText(String imagePath) {
        try {
            return tesseract.doOCR(new File(imagePath));
        } catch (TesseractException e) {
            throw new RuntimeException("OCR processing failed: " + e.getMessage());
        }
    }

    @Override
    public String extractText(BufferedImage image) {
        try {
            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            throw new RuntimeException("OCR processing failed: " + e.getMessage());
        }
    }
}
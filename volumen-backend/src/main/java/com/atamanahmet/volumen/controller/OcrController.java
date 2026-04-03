package com.atamanahmet.volumen.controller;

import com.atamanahmet.volumen.service.ImageService;
import com.atamanahmet.volumen.service.OcrService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/ocr")
public class OcrController {

    private final OcrService ocrService;
    private final ImageService imageService;

    public OcrController(OcrService ocrService, ImageService imageService) {
        this.ocrService = ocrService;
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> handleFileUpload(@RequestParam("file") MultipartFile file) {
        try (InputStream in = file.getInputStream()) {
            BufferedImage original = ImageIO.read(in);
            BufferedImage resized = imageService.resizeByWidth(original, 1200);

            String result = ocrService.extractText(resized).replaceAll("[^a-zA-Z0-9]", " ");
            imageService.saveImage(resized, "jpg", "resized_output.jpg");

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("OCR error: " + e.getMessage());
        }
    }
}
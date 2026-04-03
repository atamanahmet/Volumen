package com.atamanahmet.volumen.service;

import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

@Service
public class ImageService {

    public BufferedImage resizeByWidth(BufferedImage originalImage, int targetWidth) {
        int originalHeight = originalImage.getHeight();
        int originalWidth = originalImage.getWidth();
        int targetHeight = (targetWidth * originalHeight) / originalWidth;
        return resize(originalImage, targetWidth, targetHeight);
    }

    public BufferedImage resize(BufferedImage originalImage, int targetWidth, int targetHeight) {
        Image tmp = originalImage.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(tmp, 0, 0, null);
        g2d.dispose();
        return resized;
    }

    public void saveImage(BufferedImage image, String format, String outputPath) throws IOException {
        ImageIO.write(image, format, new File(outputPath));
    }
}
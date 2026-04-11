package com.atamanahmet.volumen.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest.BodyPublishers;

@Service
public class OcrService {

    private final HttpClient httpClient;
    private final String ocrServiceUrl;

    public OcrService(@Value("${ocr.service.url}") String ocrServiceUrl) {
        this.httpClient = HttpClient.newHttpClient();
        this.ocrServiceUrl = ocrServiceUrl;
    }

    public String extractText(MultipartFile file) throws IOException, InterruptedException {
        String boundary = "----VolumenBoundary" + System.currentTimeMillis();
        byte[] fileBytes = file.getBytes();
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";

        byte[] body = buildMultipartBody(boundary, fileName, fileBytes);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ocrServiceUrl + "/ocr"))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(BodyPublishers.ofByteArray(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OCR service error: " + response.body());
        }

        return response.body();
    }

    private byte[] buildMultipartBody(String boundary, String fileName, byte[] fileBytes) throws IOException {
        String CRLF = "\r\n";
        String delimiter = "--" + boundary;

        StringBuilder sb = new StringBuilder();
        sb.append(delimiter).append(CRLF);
        sb.append("Content-Disposition: form-data; name=\"file\"; filename=\"").append(fileName).append("\"")
                .append(CRLF);
        sb.append("Content-Type: image/jpeg").append(CRLF);
        sb.append(CRLF);

        byte[] header = sb.toString().getBytes();
        String footer = CRLF + delimiter + "--" + CRLF;
        byte[] footerBytes = footer.getBytes();

        byte[] result = new byte[header.length + fileBytes.length + footerBytes.length];
        System.arraycopy(header, 0, result, 0, header.length);
        System.arraycopy(fileBytes, 0, result, header.length, fileBytes.length);
        System.arraycopy(footerBytes, 0, result, header.length + fileBytes.length, footerBytes.length);

        return result;
    }
}
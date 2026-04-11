# Volumen - Book Scanner & Library Tracker
Volumen is a cross-platform app for cataloging your physical books. Point your phone at a book cover or barcode, the backend pulls metadata from OpenLibrary, you confirm the correct result, and it saves to your collection. The web app shows everything you've scanned.

## Prerequisites
- **Java 17+ JVM** - backend
- **PostgreSQL** - database
- **Node.js** - web and mobile
- **Expo Go** - for running the mobile app

## How it works
**Mobile (React Native + Expo)**
- Choose between OCR or barcode scan mode
- Image is sent to the backend for processing
- OpenLibrary results come back, pick the correct one
- Confirmed book gets saved to your collection

**Backend**
- Built with Java and Spring Boot
- Processes incoming image or barcode from mobile
- Queries OpenLibrary API for book metadata
- Stores confirmed books in PostgreSQL

**Web**
- Built with React and TypeScript
- Shows your saved book collection

## Getting Started
**Mobile**
- Install Expo Go from Play Store on your phone
- Run `npm install` in the volumen-mobile directory
- Run `npx expo start` and scan the QR code with Expo Go

**Web**
- Run `npm install` in the volumen-web directory
- Run `npm run dev`

**Backend**
- Copy `.env.example` to `.env` and fill in your credentials
- Run `./mvnw spring-boot:run`

## Notes
- Work in progress, core scan-to-save and ui flow is working
- Barcode is more reliable than OCR. OCR accuracy drops on stylized covers or poor lighting
- OpenLibrary requires no API key. Coverage is good for English titles, OCR mode handles Turkish books where barcode lookup fails

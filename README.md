# Volumen - Book Scanner & Library Tracker

Volumen is a cross-platform app for cataloging physical books.

## Prerequisites

- **Docker** - runs everything
- **Make** - to run Makefile commands
- **Expo Go** - for running the mobile app

## How it works

**Mobile (React Native + Expo)**
- Choose between OCR or ISBN mode
- Take a photo or upload from gallery, extracted text is shown for review, edit if anything looks off
- OpenLibrary results come back, pick the correct one
- Confirmed book gets saved to your collection

**OCR Microservice (Python + RapidOCR)**
- Receives image from mobile
- Extracts text using RapidOCR
- Returns raw text to mobile for user review before search

**Backend (Java + Spring Boot)**
- Queries OpenLibrary API using extracted/edited text or ISBN
- Stores confirmed books in PostgreSQL

**Web (React + Tailwind)**
- Shows your saved book collection
- Grid and list view with search and sort

## Getting Started

**All services**
```bash
make start
```
This starts PostgreSQL, OCR service, backend and web.

**Mobile**
- Install Expo Go from Play Store
- Run `npm install` in `volumen-mobile`
- Run `npx expo start` and scan the QR code with Expo Go

## Notes

- Work in progress, core scan-to-save and UI flow is working
- ISBN mode is more reliable than OCR
- OCR accuracy drops on stylized covers or poor lighting
- OpenLibrary requires no API key
- OCR mode handles Turkish books where ISBN lookup fails

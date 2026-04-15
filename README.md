# Volumen - Book Scanner & Library Tracker

Volumen is a cross-platform app for cataloging physical books.

## Prerequisites

- **Docker** - runs everything
- **Make** - to run Makefile commands
- **Node.js** - for running the mobile app
- **Expo Go** - for running the mobile app on device

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
- Install Expo Go from [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779)
- Run `npm install` in `volumen-mobile`
- Run `npx expo start --lan` and scan the QR code with Expo Go

> Your phone and computer must be on the same network.
> No `.env` needed, the app automatically detects your machine's LAN IP from Expo at runtime.
> **Note:** This is a development build, not a packaged or released app. Not tested on iOS. Expect rough edges.

**Expo Web (UI testing only)**
The mobile app also runs in browser for quick UI testing, no phone needed:
```bash
cd volumen-mobile
npx expo start --web
```
> Expo Web does not support camera or barcode scanning. OCR via file upload still works.

## Notes

- Work in progress, core scan-to-save and UI flow is working
- ISBN mode is more reliable than OCR
- OCR accuracy drops on stylized covers or poor lighting
- OpenLibrary requires no API key
- OCR mode handles Turkish books where ISBN lookup fails

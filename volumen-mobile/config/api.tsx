// For Expo Web (browser): backend is on localhost
// For physical device on same network: set EXPO_PUBLIC_API_URL in .env
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export const API = {
  ocr: {
    upload: `${BASE_URL}/ocr/upload`,
  },
  search: {
    byText: (text: string) => `${BASE_URL}/search/${encodeURIComponent(text)}`,
    byIsbn: (isbn: string) => `${BASE_URL}/books/isbn/${isbn}`,
  },
  books: {
    list: (userId: string) => `${BASE_URL}/books/list?userId=${userId}`,
    save: (userId: string) => `${BASE_URL}/books/save?userId=${userId}`,
  },
};

// For Expo Web (browser): backend is on localhost

import Constants from "expo-constants";
import { Platform } from "react-native";

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

const getBaseUrl = () => {
  if (Platform.OS === "web") {
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${hostname}:8080`;
  }

  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:8080`;

  return "http://localhost:8080";
};

const BASE_URL = getBaseUrl();

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

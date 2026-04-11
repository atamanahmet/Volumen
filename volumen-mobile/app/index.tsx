import { API } from "@/config/api";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import BookListModal, { Book } from "@/components/BookListModal";

type Mode = "title" | "isbn";

export default function App() {
  const [mode, setMode] = useState<Mode>("title");

  // Title mode state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  // ISBN mode state
  const [isbnInput, setIsbnInput] = useState("");

  // Shared state
  const [books, setBooks] = useState<Book[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setImageUri(null);
    setExtractedText("");
    setIsbnInput("");
    setError(null);
    setBooks([]);
  };

  const uploadAndOcr = async (uri: string) => {
    setOcrLoading(true);
    try {
      const formData = new FormData();

      if (uri.startsWith("blob:") || uri.startsWith("data:")) {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("file", blob, "photo.jpg");
      } else {
        formData.append("file", {
          uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch(API.ocr.upload, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      setExtractedText(await res.text());
    } catch (e: any) {
      setError("OCR failed: " + e.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const pickAndOcr = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    await uploadAndOcr(uri);
  };

  const pickFromCamera = async () => {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera permission denied.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    setImageUri(uri);
    await uploadAndOcr(uri);
  };

  const searchByText = async () => {
    if (!extractedText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.search.byText(extractedText.trim()));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBooks(Array.isArray(data) ? data : [data]);
      setModalVisible(true);
    } catch (e: any) {
      setError("Search failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const searchByIsbn = async () => {
    const cleaned = isbnInput.trim().replace(/[-\s]/g, "");
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API.search.byIsbn(cleaned));
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      console.log("ISBN response:", JSON.stringify(data));
      setBooks(Array.isArray(data) ? data : [data]);
      setModalVisible(true);
    } catch (e: any) {
      setError("ISBN search failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appTitle}>Volumen</Text>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeBtn, mode === "title" && styles.modeBtnActive]}
          onPress={() => {
            setMode("title");
            reset();
          }}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "title" && styles.modeBtnTextActive,
            ]}
          >
            Title / OCR
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeBtn, mode === "isbn" && styles.modeBtnActive]}
          onPress={() => {
            setMode("isbn");
            reset();
          }}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "isbn" && styles.modeBtnTextActive,
            ]}
          >
            ISBN
          </Text>
        </Pressable>
      </View>

      {/* Error */}
      {!!error && <Text style={styles.error}>{error}</Text>}

      {/* Title mode */}
      {mode === "title" && (
        <View style={styles.section}>
          <View style={styles.imagePickRow}>
            <Pressable
              style={[styles.uploadBtn, { flex: 1, marginRight: 8 }]}
              onPress={pickFromCamera}
            >
              <Text style={styles.uploadBtnText}>📷 Camera</Text>
            </Pressable>
            <Pressable
              style={[styles.uploadBtn, { flex: 1, marginLeft: 8 }]}
              onPress={pickAndOcr}
            >
              <Text style={styles.uploadBtnText}>
                {imageUri ? "🖼️ Different image" : "🖼️ Gallery"}
              </Text>
            </Pressable>
          </View>

          {ocrLoading && (
            <ActivityIndicator color="#4f46e5" style={{ marginTop: 16 }} />
          )}

          {!!extractedText && !ocrLoading && (
            <>
              <Text style={styles.label}>Extracted text (edit if needed):</Text>
              <TextInput
                style={styles.textArea}
                multiline
                value={extractedText}
                onChangeText={setExtractedText}
              />
              <Pressable
                style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
                onPress={searchByText}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.searchBtnText}>Search Books</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      )}

      {/* ISBN mode */}
      {mode === "isbn" && (
        <View style={styles.section}>
          <Text style={styles.label}>Enter ISBN:</Text>
          <TextInput
            style={styles.input}
            value={isbnInput}
            onChangeText={setIsbnInput}
            placeholder="e.g. 9780143127741"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
          <Pressable
            style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
            onPress={searchByIsbn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>Search by ISBN</Text>
            )}
          </Pressable>
        </View>
      )}

      <BookListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        books={books}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e1b4b",
    marginBottom: 32,
    letterSpacing: 1,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: "#e0e7ff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  modeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  modeBtnActive: {
    backgroundColor: "#4f46e5",
  },
  modeBtnText: {
    fontWeight: "600",
    color: "#4f46e5",
  },
  modeBtnTextActive: {
    color: "#fff",
  },
  section: {
    width: "100%",
    maxWidth: 480,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  imagePickRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  uploadBtn: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#c7d2fe",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
  },
  uploadBtnText: {
    color: "#4f46e5",
    fontWeight: "600",
    fontSize: 15,
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    fontSize: 14,
    color: "#111827",
    marginBottom: 16,
    textAlignVertical: "top",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  searchBtnDisabled: {
    opacity: 0.6,
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  error: {
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
});

import { API } from "@/config/api";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type Book = {
  author_key?: string[];
  author_name?: string[];
  ebook_access?: string;
  edition_count?: number;
  first_publish_year?: number;
  has_fulltext?: boolean;
  key: string;
  language?: string[];
  public_scan_b?: boolean;
  title: string;
  cover_i?: number;
  id?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  books: Book[];
};

const PLACEHOLDER = require("../assets/images/missing.png");
const USER_ID = "00000000-0000-0000-0000-000000000001"; // TODO: replace with real auth

export default function BookListModal({ visible, onClose, books = [] }: Props) {
  const saveBook = async (book: Book) => {
    try {
      const bookToSave = {
        ...book,
        id: book.id ?? book.key,
      };
      const res = await fetch(API.books.save(USER_ID), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookToSave),
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert("Saved", `"${book.title}" added to your library.`);
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Results ({books.length})</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {books.length === 0 ? (
            <Text style={styles.empty}>No books found.</Text>
          ) : (
            <FlatList
              data={books}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => saveBook(item)}>
                  <Image
                    source={
                      item.cover_i
                        ? {
                            uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`,
                          }
                        : PLACEHOLDER
                    }
                    style={styles.cover}
                  />
                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.author} numberOfLines={1}>
                      {item.author_name?.join(", ") || "Unknown author"}
                    </Text>
                    {!!item.first_publish_year && (
                      <Text style={styles.year}>{item.first_publish_year}</Text>
                    )}
                    <Text style={styles.tapHint}>Tap to save to library</Text>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0009",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cover: {
    width: 70,
    height: 100,
    backgroundColor: "#e0e7ff",
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  year: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 6,
  },
  tapHint: {
    fontSize: 11,
    color: "#4f46e5",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#9ca3af",
    padding: 40,
    fontSize: 15,
  },
});

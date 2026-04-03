import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import missingImage from "../assets/missing.png";
import { get, set } from "idb-keyval";
import "../index.css";

const getCoverUrl = (id) => `https://covers.openlibrary.org/b/id/${id}-M.jpg`;

const SORTS = [
  { label: "Title A–Z", fn: (a, b) => a.title.localeCompare(b.title) },
  { label: "Title Z–A", fn: (a, b) => b.title.localeCompare(a.title) },
  {
    label: "Author A–Z",
    fn: (a, b) =>
      (a.author_name?.[0] ?? "").localeCompare(b.author_name?.[0] ?? ""),
  },
];

const MainPage = () => {
  const [books, setBooks] = useState([]);
  const [cachedImages, setCachedImages] = useState({});
  const [query, setQuery] = useState("");
  const [sortIdx, setSortIdx] = useState(0);
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);

  const fetchAndCacheImage = async (cover_i, url) => {
    if (cachedImages[cover_i]) return;
    try {
      const cachedBlob = await get(cover_i);
      if (cachedBlob) {
        setCachedImages((prev) => ({
          ...prev,
          [cover_i]: URL.createObjectURL(cachedBlob),
        }));
        return;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      await set(cover_i, blob);
      setCachedImages((prev) => ({
        ...prev,
        [cover_i]: URL.createObjectURL(blob),
      }));
    } catch (e) {
      console.error("Image caching error:", e);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetch_ = () => {
      axios
        .get(
          "http://localhost:8080/books/list?userId=3a5554bc-312b-46bf-9086-864ccb78d25d",
        )
        .then(({ data }) => {
          if (mounted) {
            setBooks(data);
            setLoading(false);
          }
        })
        .catch((e) => {
          console.error(e);
          setLoading(false);
        });
    };
    fetch_();
    const id = setInterval(fetch_, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    books.forEach((book) => {
      if (book.cover_i && !cachedImages[book.cover_i])
        fetchAndCacheImage(book.cover_i, getCoverUrl(book.cover_i));
    });
  }, [books]);

  const displayed = useMemo(() => {
    const q = query.toLowerCase();
    return books
      .filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author_name?.some((a) => a.toLowerCase().includes(q)),
      )
      .sort(SORTS[sortIdx].fn);
  }, [books, query, sortIdx]);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>Library</span>
          <span style={styles.count}>
            {displayed.length} / {books.length} volumes
          </span>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchWrap}>
            <svg
              style={styles.searchIcon}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="18" y2="18" />
            </svg>
            <input
              style={styles.search}
              placeholder="Search title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button style={styles.clearBtn} onClick={() => setQuery("")}>
                ✕
              </button>
            )}
          </div>

          <select
            style={styles.select}
            value={sortIdx}
            onChange={(e) => setSortIdx(Number(e.target.value))}
          >
            {SORTS.map((s, i) => (
              <option key={i} value={i}>
                {s.label}
              </option>
            ))}
          </select>

          <div style={styles.toggle}>
            {["grid", "list"].map((v) => (
              <button
                key={v}
                style={{
                  ...styles.toggleBtn,
                  ...(view === v ? styles.toggleBtnActive : {}),
                }}
                onClick={() => setView(v)}
              >
                {v === "grid" ? (
                  <GridIcon active={view === "grid"} />
                ) : (
                  <ListIcon active={view === "list"} />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div style={styles.divider} />

      {loading ? (
        <p style={styles.empty}>Loading collection…</p>
      ) : displayed.length === 0 ? (
        <p style={styles.empty}>No books found.</p>
      ) : view === "grid" ? (
        <GridView books={displayed} cachedImages={cachedImages} />
      ) : (
        <ListView books={displayed} cachedImages={cachedImages} />
      )}
    </div>
  );
};

const GridView = ({ books, cachedImages }) => (
  <div style={styles.grid}>
    {books.map((book) => {
      const src =
        book.cover_i && cachedImages[book.cover_i]
          ? cachedImages[book.cover_i]
          : missingImage;
      return (
        <div
          key={book.id}
          style={styles.gridItem}
          onClick={() =>
            book.key &&
            window.open(`https://openlibrary.org${book.key}`, "_blank")
          }
        >
          <div className="book-container">
            <div className="book">
              <div>
                <img src={src} alt={book.title} style={styles.coverImg} />
              </div>
            </div>
          </div>
          <div style={styles.gridMeta}>
            <p style={styles.gridTitle}>{book.title}</p>
            <p style={styles.gridAuthor}>
              {book.author_name?.join(", ") || "Unknown"}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

const ListView = ({ books, cachedImages }) => (
  <div style={styles.list}>
    {books.map((book, i) => {
      const src =
        book.cover_i && cachedImages[book.cover_i]
          ? cachedImages[book.cover_i]
          : missingImage;
      return (
        <div
          key={book.id}
          style={styles.listRow}
          onClick={() =>
            book.key &&
            window.open(`https://openlibrary.org${book.key}`, "_blank")
          }
        >
          <span style={styles.listIndex}>{String(i + 1).padStart(2, "0")}</span>
          <div style={styles.listBookWrap} className="book-container">
            <div className="book book--small">
              <div>
                <img src={src} alt={book.title} style={styles.coverImg} />
              </div>
            </div>
          </div>
          <div style={styles.listMeta}>
            <span style={styles.listTitle}>{book.title}</span>
            <span style={styles.listAuthor}>
              {book.author_name?.join(", ") || "Unknown"}
            </span>
          </div>
          <svg
            style={styles.arrowIcon}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </div>
      );
    })}
  </div>
);

const GridIcon = ({ active }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill={active ? "#FFB347" : "#7a5c3a"}
  >
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

const ListIcon = ({ active }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke={active ? "#FFB347" : "#7a5c3a"}
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <line x1="2" y1="4" x2="14" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
  </svg>
);

const styles = {
  root: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    backgroundColor: "#1C0F00",
    minHeight: "100vh",
    color: "#FFB347",
    paddingTop: "5rem",
    paddingBottom: "4rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    paddingInline: "clamp(1.5rem, 5vw, 4rem)",
    marginBottom: "1.25rem",
  },
  headerLeft: {
    display: "flex",
    alignItems: "baseline",
    gap: "1.25rem",
  },
  logo: {
    fontSize: "1.6rem",
    fontWeight: "700",
    letterSpacing: "0.22em",
    color: "#FFB347",
  },
  count: {
    fontSize: "0.78rem",
    letterSpacing: "0.12em",
    color: "#7a5c3a",
    textTransform: "uppercase",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "0.65rem",
    width: "14px",
    height: "14px",
    color: "#7a5c3a",
    pointerEvents: "none",
  },
  search: {
    background: "#2A1500",
    border: "1px solid #3d2200",
    borderRadius: "4px",
    color: "#FFB347",
    fontSize: "0.82rem",
    padding: "0.45rem 2rem 0.45rem 2.1rem",
    width: "220px",
    outline: "none",
    letterSpacing: "0.04em",
    fontFamily: "inherit",
  },
  clearBtn: {
    position: "absolute",
    right: "0.5rem",
    background: "none",
    border: "none",
    color: "#7a5c3a",
    cursor: "pointer",
    fontSize: "0.75rem",
    padding: 0,
    lineHeight: 1,
  },
  select: {
    background: "#2A1500",
    border: "1px solid #3d2200",
    borderRadius: "4px",
    color: "#FFB347",
    fontSize: "0.8rem",
    padding: "0.45rem 0.7rem",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
  },
  toggle: {
    display: "flex",
    border: "1px solid #3d2200",
    borderRadius: "4px",
    overflow: "hidden",
  },
  toggleBtn: {
    background: "#2A1500",
    border: "none",
    padding: "0.45rem 0.6rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  toggleBtnActive: {
    background: "#3d2200",
  },
  divider: {
    height: "1px",
    backgroundColor: "#3d2200",
    marginInline: "clamp(1.5rem, 5vw, 4rem)",
    marginBottom: "2.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "2.5rem 2rem",
    paddingInline: "clamp(1.5rem, 5vw, 4rem)",
  },
  gridItem: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  gridMeta: { marginTop: "0.85rem", width: "100%" },
  gridTitle: {
    color: "#FFB347",
    fontSize: "0.85rem",
    fontWeight: "600",
    margin: "0 0 0.2rem",
    lineHeight: 1.35,
    letterSpacing: "0.01em",
  },
  gridAuthor: {
    color: "#7a5c3a",
    fontSize: "0.75rem",
    margin: 0,
    letterSpacing: "0.04em",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    paddingInline: "clamp(1.5rem, 5vw, 4rem)",
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    padding: "1rem 0",
    borderBottom: "1px solid #2A1500",
    cursor: "pointer",
  },
  listIndex: {
    color: "#3d2200",
    fontSize: "0.75rem",
    letterSpacing: "0.1em",
    minWidth: "1.8rem",
  },
  listBookWrap: { flexShrink: 0 },
  listMeta: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.2rem",
    minWidth: 0,
  },
  listTitle: {
    color: "#FFB347",
    fontSize: "0.95rem",
    fontWeight: "600",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  listAuthor: {
    color: "#7a5c3a",
    fontSize: "0.8rem",
    letterSpacing: "0.04em",
  },
  arrowIcon: {
    width: "16px",
    height: "16px",
    color: "#3d2200",
    flexShrink: 0,
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "0 2px 2px 0",
  },
  empty: {
    textAlign: "center",
    color: "#7a5c3a",
    fontSize: "0.9rem",
    letterSpacing: "0.08em",
    marginTop: "5rem",
  },
};

export default MainPage;

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
          "http://localhost:8080/books/list?userId=00000000-0000-0000-0000-000000000001",
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
    <div className="font-[Cormorant_Garamond] bg-[#1C0F00] min-h-screen text-amber-400 pt-20 pb-16 -mt-10">
      <header className="flex items-center justify-between flex-wrap gap-4 px-[clamp(1.5rem,5vw,4rem)] mb-5">
        <div className="flex items-baseline gap-5">
          <span className="text-3xl font-bold tracking-[0.22em] text-amber-400">
            Library
          </span>
          <span className="text-[0.78rem] tracking-[0.12em] text-amber-600 uppercase">
            {displayed.length} / {books.length} volumes
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center">
            <svg
              className="absolute left-[0.65rem] w-3.5 h-3.5 text-amber-600 pointer-events-none"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="18" y2="18" />
            </svg>
            <input
              className="bg-amber-950 border border-amber-800 rounded text-amber-400 text-md py-[0.45rem] pl-[2.1rem] pr-8 w-55 outline-none tracking-[0.04em] font-[inherit]"
              placeholder="Search title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                className="absolute right-2 bg-transparent border-none text-amber-600 cursor-pointer text-[0.75rem] p-0 leading-none"
                onClick={() => setQuery("")}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            className="bg-amber-950 border border-amber-800 rounded text-amber-400 text-lg py-[0.45rem] px-[0.7rem] outline-none cursor-pointer font-[inherit] tracking-[0.04em]"
            value={sortIdx}
            onChange={(e) => setSortIdx(Number(e.target.value))}
          >
            {SORTS.map((s, i) => (
              <option key={i} value={i}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Grid/List toggle */}
          <div className="flex border border-amber-800 rounded overflow-hidden">
            {["grid", "list"].map((v) => (
              <button
                key={v}
                className={`border-none py-[0.68rem] px-[0.72rem] cursor-pointer flex items-center ${view === v ? "bg-amber-800" : "bg-amber-950"}`}
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

      <div className="h-px bg-amber-800 mx-[clamp(1.5rem,5vw,4rem)] mb-10" />

      {loading ? (
        <p className="text-center text-amber-600 text-[0.9rem] tracking-[0.08em] mt-20">
          Loading collection…
        </p>
      ) : displayed.length === 0 ? (
        <p className="text-center text-amber-600 text-[0.9rem] tracking-[0.08em] mt-20">
          No books found.
        </p>
      ) : view === "grid" ? (
        <GridView books={displayed} cachedImages={cachedImages} />
      ) : (
        <ListView books={displayed} cachedImages={cachedImages} />
      )}
    </div>
  );
};

const GridView = ({ books, cachedImages }) => (
  <div
    className="grid gap-x-10 gap-y-10 px-16"
    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
  >
    {books.map((book) => {
      const src =
        book.cover_i && cachedImages[book.cover_i]
          ? cachedImages[book.cover_i]
          : missingImage;
      return (
        <div
          key={book.id}
          className="cursor-pointer flex flex-col items-center pb-4 mt-5"
          onClick={() =>
            book.key &&
            window.open(`https://openlibrary.org${book.key}`, "_blank")
          }
        >
          <div className="book-container">
            <div className="book -ml-8">
              <div>
                <img
                  src={src}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-r-sm"
                />
              </div>
            </div>
          </div>
          <div className="mt-3 w-52 text-xl">
            <p className="text-amber-300 font-semibold mb-1 leading-snug mt-10">
              {book.title}
            </p>
            <p className="text-amber-600 ">
              {book.author_name?.join(", ") || "Unknown"}
            </p>
          </div>
        </div>
      );
    })}
  </div>
);

const ListView = ({ books, cachedImages }) => (
  <div className="flex flex-col px-[clamp(1.5rem,5vw,4rem)] -mt-10">
    {books.map((book, i) => {
      const src =
        book.cover_i && cachedImages[book.cover_i]
          ? cachedImages[book.cover_i]
          : missingImage;
      return (
        <div
          key={book.id}
          className="flex items-center gap-5 py-15 border-b border-amber-800 cursor-pointer "
          onClick={() =>
            book.key &&
            window.open(`https://openlibrary.org${book.key}`, "_blank")
          }
        >
          <span className="text-amber-400 tracking-widest min-w-[1.8rem] text-xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="shrink-0 book-container ">
            <div className="book book--small">
              <div>
                <img
                  src={src}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-r-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2 min-w-0 ml-5">
            <span className="text-amber-400 text-xl font-semibold tracking-[0.01em] truncate">
              {book.title}
            </span>
            <span className="text-amber-600 tracking-[0.04em] text-lg">
              {book.author_name?.join(", ") || "Unknown"}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-amber-800 shrink-0"
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

export default MainPage;

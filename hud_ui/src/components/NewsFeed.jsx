"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import NewsCard from "./NewsCard";

export default function NewsFeed({ preferences }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);
  const itemsPerPage = 5;

  async function fetchFeed() {
    try {
      const res = await fetch(`/api/feed`);
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchNews() {
    setFetching(true);
    try {
      // Fetch from both Hacker News and Reddit in parallel
      await Promise.all([
        fetch("/api/news"), // Hacker News
        fetch("/api/reddit"), // Reddit
      ]);
      await fetchFeed(); // reload feed after both fetches complete
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, [preferences]);

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (!items.length) return;

    if (!paused) {
      intervalRef.current = setInterval(() => {
        setCurrentPage((prev) =>
          (prev + 1) * itemsPerPage >= items.length ? 0 : prev + 1
        );
      }, 3000);
    }

    return () => clearInterval(intervalRef.current);
  }, [items, paused]);

  if (loading)
    return (
      <p className="text-cyan-300 animate-pulse text-center mt-10">
        Initializing Feed...
      </p>
    );

  // Calculate current items to show
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-gray-950 via-black to-gray-900 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.6)]">
          🚀 Your Futuristic Feed
        </h1>
        <Button
          onClick={handleFetchNews}
          disabled={fetching}
          className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
        >
          {fetching ? "Fetching..." : "⚡ Fetch News"}
        </Button>
      </div>

      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex flex-col space-y-6">
          {currentItems.map((item) => (
            <div
              key={item._id}
              className="transition-all duration-500 hover:scale-[1.01]"
            >
              <NewsCard item={item} />
            </div>
          ))}
        </div>

        {/* Pagination indicators */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-3">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentPage
                    ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)] scale-110"
                    : "bg-gray-700 hover:bg-cyan-500/60"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

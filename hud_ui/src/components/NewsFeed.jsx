"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import NewsCard from "./NewsCard";

export default function NewsFeed({ preferences }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

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
      await fetch("/api/news"); // populate DB
      await fetchFeed(); // reload feed
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, [preferences]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (!items.length) return;

    if (!paused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 3000);
    }

    return () => clearInterval(intervalRef.current);
  }, [items, paused]);

  if (loading) return <p>Loading feed...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Your Feed</h1>
        <Button onClick={handleFetchNews} disabled={fetching}>
          {fetching ? "Fetching..." : "Fetch News"}
        </Button>
      </div>

      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {items.map((item, index) => (
          <div
            key={item._id}
            className={`absolute top-0 left-0 w-full transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <NewsCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}

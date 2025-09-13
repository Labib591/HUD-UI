"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewsFeed({ preferences }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  async function fetchFeed() {
    try {
      const res = await fetch(`/api/feed`);
      const data = await res.json();
      console.log(data);
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

  if (loading) return <p>Loading feed...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Your Feed</h1>
        <Button onClick={handleFetchNews} disabled={fetching}>
          {fetching ? "Fetching..." : "Fetch News"}
        </Button>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item._id} className="mb-4">
            <a href={item.url} target="_blank" className="text-blue-600">
              {item.title}
            </a>
            <p className="text-sm text-gray-500">
              Source: {item.source} | Tags: {item.tags?.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

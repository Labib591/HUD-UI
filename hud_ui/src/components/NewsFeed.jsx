import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import NewsCard from "./NewsCard";
import api from "../../lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";


export default function NewsFeed({ preferences, session }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [sortByPopularity, setSortByPopularity] = useState(false);
  const intervalRef = useRef(null);
  const itemsPerPage = 5;

  // Fetch bookmarked items
  const fetchBookmarkedItems = async () => {
    try {
      const { data } = await api.get('/bookmark');
      const bookmarkedIds = new Set(data.bookmarks.map(item => item._id.toString()));
      setBookmarkedItems(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarked items:', error);
    }
  };

  async function fetchFeed() {
    try {
      const { data } = await api.get(`/feed`);
      setItems(data.items || []);
      
      // Fetch bookmarked items after loading feed
      if (session) {
        await fetchBookmarkedItems();
      }
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleFetchNews() {
    setFetching(true);
    try {
      // Fetch from Hacker News, Reddit, and Twitter in parallel
      await Promise.all([
        api.get("/news"),     // Hacker News
        api.get("/reddit"),   // Reddit
        // api.get("/twitter"),  // Twitter
      ]);
      await fetchFeed(); // reload feed after all fetches complete
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchFeed();
  }, [preferences, session]);

  useEffect(() => {
    handleFetchNews(); // fetch once when loaded
    const interval = setInterval(() => {
      console.log("⏰ Auto-fetching news...");
      handleFetchNews();
    }, 3600000); // every 1 hour
  
    return () => clearInterval(interval);
  }, []);
  

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


    const sortedItems = [...(items || [])].sort((a, b) => {
      if (sortByPopularity) {
        return (b.popularity || 0) - (a.popularity || 0);
      } else {
        return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
      }
    });

  // Calculate current items to show
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-b from-gray-900 via-black to-gray-800 rounded-2xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.15)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
  <h1 className="text-2xl font-bold tracking-wide text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.6)]">
    🚀 Your Futuristic Feed
  </h1>
  <div className="flex items-center gap-4">
    <div className="flex items-center space-x-2">
      <Switch 
        id="sort-mode" 
        checked={sortByPopularity}
        onCheckedChange={setSortByPopularity}
        className="data-[state=checked]:bg-cyan-500"
      />
      <Label htmlFor="sort-mode" className="text-gray-300 cursor-pointer">
        {sortByPopularity ? 'Popular' : 'Latest'}
      </Label>
    </div>
    <Button
      onClick={handleFetchNews}
      disabled={fetching}
      className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
    >
      {fetching ? "Fetching..." : "⚡ Fetch News"}
    </Button>
  </div>
</div>

      <div
        className="relative w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex flex-col space-y-6">
          {currentItems.map((item) => (
            <div key={item._id} className="w-full">
              <NewsCard 
                item={item}
                onBookmark={async (item, isBookmarked) => {
                  try {
                    const method = isBookmarked ? 'delete' : 'post';
                    await api[method]('/bookmark', { _id: item._id });
                    
                    // Update local state
                    setBookmarkedItems(prev => {
                      const newSet = new Set(prev);
                      isBookmarked ? newSet.delete(item._id) : newSet.add(item._id);
                      return newSet;
                    });
                  } catch (error) {
                    console.error('Error updating bookmark:', error);
                  }
                }}
                isBookmarked={bookmarkedItems.has(item._id.toString())}
              />
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

"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NewsCard from '@/components/NewsCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import api from '../../../lib/api';

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchBookmarks();
    }
  }, [status, router]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookmark');
      
      const data =  response.data.bookmarks;
      setBookmarks(data || []);
    } catch (err) {
      console.error('Error in fetchBookmarks:', err);
      setError(err.message || 'Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (item, isBookmarked) => {
    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await api[method]('/bookmark', { _id: item._id });
      return response.data;

      // Refresh bookmarks after successful operation
      fetchBookmarks();
    } catch (err) {
      console.error('Error updating bookmark:', err);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-cyan-400 animate-pulse text-lg">
          ⚡ Loading your bookmarks...
        </p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.7)]">
            My Bookmarks
          </h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
          >
            Go Back
          </Button>
        </div>

        {error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">You haven't bookmarked any items yet.</p>
            <Button
              onClick={() => router.push('/')}
              className="bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.6)]"
            >
              Browse News
            </Button>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {bookmarks.map((bookmark) => (
              <div key={bookmark._id} className="w-full">
                <NewsCard 
                  item={bookmark}
                  onBookmark={handleBookmark}
                  isBookmarked={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
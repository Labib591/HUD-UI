import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, MessageSquare, Repeat2, Heart, Twitter } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export default function NewsCard({ item, onBookmark, isBookmarked: initialBookmarked = false }) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const isTwitter = item.source?.toLowerCase().includes('twitter')
  const metadata = item.metadata || {}
  
  const handleBookmarkClick = async (e) => {
    e.stopPropagation();
    if (isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      await onBookmark?.(item, isBookmarked);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      // You might want to show an error toast here
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <Card className={`w-full bg-gradient-to-br from-gray-900 via-black to-gray-950 border ${isTwitter ? 'border-blue-500/30' : 'border-cyan-500/30'} shadow-[0_0_15px_rgba(0,255,255,0.2)] rounded-2xl hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all duration-300 p-5`}>
      {isTwitter && (
        <div className="flex items-center text-blue-400 mb-3">
          <Twitter className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Tweet from {metadata.author || item.source}</span>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          {isTwitter && metadata.author_image && (
            <div className="flex items-center mb-2">
              <Image 
                src={metadata.author_image} 
                alt={metadata.author}
                width={40}
                height={40}
                className="rounded-full mr-3"
              />
              <div>
                <div className="font-semibold text-white">{metadata.author}</div>
                <div className="text-sm text-gray-400">@{metadata.author_username}</div>
              </div>
            </div>
          )}
          <CardTitle className="text-lg font-semibold tracking-wide">
            {isTwitter ? (
              <div className="text-white whitespace-pre-line">{item.content}</div>
            ) : (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 hover:underline underline-offset-4 transition-colors duration-200"
              >
                {item.title}
              </a>
            )}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBookmarkClick}
          disabled={isBookmarking}
          className={`${isBookmarked ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300'} hover:bg-opacity-10 rounded-full transition-all ml-2`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add to bookmarks'}
        >
          {isBookmarking ? (
            <span className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          )}
        </Button>
      </CardHeader>

      {!isTwitter && item.description && (
        <CardContent className="pb-3">
          <p className="text-sm text-gray-300 leading-relaxed">{item.description}</p>
        </CardContent>
      )}

      <CardFooter className="flex justify-between items-center pt-3 border-t border-gray-800">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          {isTwitter ? (
            <>
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{metadata.replies || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Repeat2 className="h-4 w-4" />
                <span>{metadata.retweets || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{metadata.likes || 0}</span>
              </div>
            </>
          ) : (
            <>
              <span className="text-cyan-300">Source:</span>
              <span>{item.source}</span>
              {item.tags?.length > 0 && (
                <>
                  <span className="text-cyan-300">Tags:</span>
                  <span>{item.tags.join(", ")}</span>
                </>
              )}
              <span className="text-cyan-300">Popularity:</span>
              <span>{item.popularity}</span>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

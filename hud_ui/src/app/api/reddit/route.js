import axios from "axios";
import dbConnect from "../../../../lib/mongoose";
import FeedItem from "../../../../models/FeedItem";
import { autoTagger } from "../../../../lib/autoTagger";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // Fetch top posts from r/programming and r/technology
    const subreddits = ['programming', 'technology', 'webdev', 'SaaS'];
    let allPosts = [];

    // Fetch top posts from each subreddit
    for (const subreddit of subreddits) {
      try {
        const { data } = await axios.get(
          `https://www.reddit.com/r/${subreddit}/top.json?limit=10&t=day`,
          {
            headers: {
              'User-Agent': 'HUD-UI/1.0'
            }
          }
        );
        
        // Add subreddit info to each post
        const posts = data.data.children.map(post => ({
          ...post.data,
          subreddit: subreddit
        }));
        
        allPosts = [...allPosts, ...posts];
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error.message);
        continue;
      }
    }

    // Sort by score and take top 20
    const topPosts = allPosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    let insertedCount = 0;

    for (const post of topPosts) {
      if (!post?.id || !post?.title) continue;

      const exists = await FeedItem.findOne({ 
        $or: [
          { url: `https://reddit.com${post.permalink}` },
          { url: post.url }
        ]
      });
      
      if (exists) continue;

      // Use selftext if available, otherwise use title
      const content = post.selftext || post.title;
      const truncatedContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

      // Call Gemini autoTagger
      const tags = await autoTagger(post.title, truncatedContent);
      
      // Add subreddit as a tag
      if (post.subreddit) {
        tags.push(`r/${post.subreddit}`);
      }

      await FeedItem.create({
        title: post.title,
        url: post.url.startsWith('http') ? post.url : `https://reddit.com${post.permalink}`,
        source: `Reddit${post.subreddit ? `:r/${post.subreddit}` : ''}`,
        popularity: post.score || 0,
        tags: [...new Set(tags)], // Remove duplicate tags
        publishedAt: new Date(post.created_utc * 1000),
      });

      insertedCount++;
    }

    return NextResponse.json({ 
      status: "success", 
      inserted: insertedCount,
      totalFetched: topPosts.length
    });

  } catch (error) {
    console.error("Error in /api/reddit:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

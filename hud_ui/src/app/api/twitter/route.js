import { TwitterApi } from 'twitter-api-v2';
import dbConnect from "../../../../lib/mongoose";
import FeedItem from "../../../../models/FeedItem";
import { autoTagger } from "../../../../lib/autoTagger";
import { NextResponse } from "next/server";

// Twitter API v2 credentials
const twitterClient = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_KEY_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

// List of Twitter usernames to fetch tweets from (reduced for rate limiting)
const X_ACCOUNTS = [
  'sama',
  'AndrewYNg',
  'demishassabis'
];

// Helper function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    await dbConnect();
    
    const rwClient = twitterClient.readWrite;
    let allTweets = [];
    
    // Fetch recent tweets from each account with delay
    for (const [index, username] of X_ACCOUNTS.entries()) {
      try {
        // Add delay between requests (1.5 seconds)
        if (index > 0) {
          await delay(1500);
        }

        const user = await rwClient.v2.userByUsername(username);
        const tweets = await rwClient.v2.userTimeline(user.data.id, {
          'tweet.fields': ['created_at', 'public_metrics'],
          'expansions': ['author_id'],
          'user.fields': ['username', 'name', 'profile_image_url'],
          max_results: 5, // Reduced from 10 to 5
        });
        
        const tweetsWithUser = tweets.data.data.map(tweet => ({
          ...tweet,
          user: tweets.includes.users[0],
          source: 'X'
        }));
        
        allTweets = [...allTweets, ...tweetsWithUser];
      } catch (error) {
        console.error(`Error fetching tweets from @${username}:`, error.message);
        if (error.rateLimit) {
          // If we hit rate limit, wait for the reset time
          const resetTime = error.rateLimit.reset * 1000; // Convert to milliseconds
          const waitTime = resetTime - Date.now();
          if (waitTime > 0) {
            console.log(`Rate limited. Waiting ${Math.ceil(waitTime/1000)} seconds...`);
            await delay(waitTime);
          }
        }
        continue;
      }
    }

    // Sort by engagement (likes + retweets)
    const sortedTweets = allTweets
      .sort((a, b) => {
        const engagementA = (a.public_metrics.like_count || 0) + (a.public_metrics.retweet_count || 0);
        const engagementB = (b.public_metrics.like_count || 0) + (b.public_metrics.retweet_count || 0);
        return engagementB - engagementA;
      })
      .slice(0, 40); // Top 40 most engaging tweets

    let insertedCount = 0;

    for (const tweet of sortedTweets) {
      if (!tweet?.id) continue;

      const exists = await FeedItem.findOne({ 
        url: `https://x.com/${tweet.user.username}/status/${tweet.id}`
      });
      
      if (exists) continue;

      // Call Gemini autoTagger
      const tags = await autoTagger(
        `Tweet by @${tweet.user.username}`,
        tweet.text
      );
      
      // Add Twitter and account as tags
      tags.push('X', `@${tweet.user.username}`);

      await FeedItem.create({
        title: `@${tweet.user.username}: ${tweet.text.length > 100 ? tweet.text.substring(0, 97) + '...' : tweet.text}`,
        content: tweet.text,
        url: `https://x.com/${tweet.user.username}/status/${tweet.id}`,
        source: `X: @${tweet.user.username}`,
        popularity: (tweet.public_metrics.like_count || 0) + (tweet.public_metrics.retweet_count || 0),
        tags: [...new Set(tags)],
        publishedAt: new Date(tweet.created_at),
        metadata: {
          author: tweet.user.name,
          author_username: tweet.user.username,
          author_image: tweet.user.profile_image_url,
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count
        }
      });

      insertedCount++;
    }

    return NextResponse.json({ 
      status: "success", 
      inserted: insertedCount,
      totalFetched: sortedTweets.length
    });

  } catch (error) {
    console.error("Error in /api/twitter:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

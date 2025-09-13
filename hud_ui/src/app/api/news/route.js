import axios from "axios";
import dbConnect from "../../../../lib/mongoose";
import FeedItem from "../../../../models/FeedItem";
import { autoTagger } from "../../../../lib/autoTagger";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    // ✅ Await the response
    const { data: ids } = await axios.get(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );

    // ✅ Use only the first 20
    const storyIds = ids.slice(0, 20);

    // Fetch all story details
    const stories = await Promise.all(
      storyIds.map(async (id) => {
        const { data } = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return data;
      })
    );

    let insertedCount = 0;

    for (const story of stories) {
      if (!story?.id || !story?.title) continue;

      const exists = await FeedItem.findOne({ url: story.url });
      if (exists) continue;

      const truncatedContent = story.text ? story.text.slice(0, 100) : "";

      // Call Gemini autoTagger
      const tags = await autoTagger(story.title, truncatedContent);

      await FeedItem.create({
        title: story.title,
        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: "HackerNews",
        popularity: story.score || 0,
        tags,
        publishedAt: new Date(story.time * 1000),
      });

      insertedCount++;
    }

    return NextResponse.json({ status: "ok", inserted: insertedCount });
  } catch (err) {
    console.error("Error in /api/news:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

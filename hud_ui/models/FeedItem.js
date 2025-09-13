import mongoose from "mongoose";

const FeedItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, required: true }, // e.g. "HackerNews", "RundownAI", "X"
    popularity: { type: Number, default: 0 }, // e.g. HN points, tweet likes
    tags: [String], // e.g. ["AI", "Startups"]
    publishedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.FeedItem ||
  mongoose.model("FeedItem", FeedItemSchema);
